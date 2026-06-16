const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const Service = require('../models/Service');
const { protect, authorize } = require('../middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();
const upload = multer(); // memory storage

async function uploadToCloudinary(file) {
  if (!file) return null;
  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  const res = await cloudinary.uploader.upload(dataUri, { folder: 'services' });
  return res.secure_url;
}

const conditionalUpload = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    return upload.single('picture')(req, res, next);
  }
  return next();
};

// Get provider's own services (Must be before GET /:id)
router.get('/provider', protect, authorize(['Service Provider', 'Admin']), async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user.id }).populate('provider', 'name email');
    return res.json({ services });
  } catch (err) {
    console.error('Fetch provider services error:', err);
    return res.status(500).json({ message: 'Failed to retrieve your services', error: err.message });
  }
});

// Create service listing
router.post('/', protect, authorize(['Service Provider', 'Admin']), conditionalUpload, async (req, res) => {
  const { title, description, category, price, deliveryTime } = req.body;
  if (!title || !description || !category || price === undefined || !deliveryTime) {
    return res.status(400).json({ message: 'All fields (title, description, category, price, deliveryTime) are required.' });
  }

  const numericPrice = Number(price);
  if (isNaN(numericPrice) || numericPrice < 5 || !Number.isInteger(numericPrice)) {
    return res.status(400).json({ message: 'Price must be an integer of at least $5 USD.' });
  }

  try {
    let imageUrl = '';
    if (req.file) {
      const url = await uploadToCloudinary(req.file);
      if (url) imageUrl = url;
    }

    const service = await Service.create({
      provider: req.user.id,
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      price: numericPrice,
      deliveryTime: Number(deliveryTime),
      imageUrl,
    });
    return res.status(201).json({ service });
  } catch (err) {
    console.error('Create service error:', err);
    return res.status(500).json({ message: 'Failed to create service listing', error: err.message });
  }
});

// Get all services (Public)
router.get('/', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice } = req.query;
    
    // Build query object
    const query = { active: true }; // Only show active services
    
    // Text search on title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }
    
    // Price range filters
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const services = await Service.find(query).populate('provider', 'name email');
    return res.json({ services });
  } catch (err) {
    console.error('Fetch all services error:', err);
    return res.status(500).json({ message: 'Failed to retrieve services', error: err.message });
  }
});

// Get single service by ID (Public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid service ID' });
    }
    const service = await Service.findById(id).populate('provider', 'name email');
    if (!service) {
      return res.status(404).json({ message: 'Service listing not found' });
    }
    return res.json({ service });
  } catch (err) {
    console.error('Fetch single service error:', err);
    return res.status(500).json({ message: 'Failed to retrieve service listing', error: err.message });
  }
});

// Update service listing
router.put('/:id', protect, authorize(['Service Provider', 'Admin']), conditionalUpload, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid service ID' });
    }

    const { title, description, category, price, deliveryTime, active } = req.body;
    let service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({ message: 'Service listing not found' });
    }

    // Verify ownership
    if (service.provider.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to update this service listing' });
    }

    if (price !== undefined) {
      const numericPrice = Number(price);
      if (isNaN(numericPrice) || numericPrice < 5 || !Number.isInteger(numericPrice)) {
        return res.status(400).json({ message: 'Price must be an integer of at least $5 USD.' });
      }
      service.price = numericPrice;
    }

    if (title) service.title = title.trim();
    if (description) service.description = description.trim();
    if (category) service.category = category.trim();
    if (deliveryTime) service.deliveryTime = Number(deliveryTime);
    if (active !== undefined) {
      service.active = active === 'true' || active === true;
    }

    if (req.file) {
      const url = await uploadToCloudinary(req.file);
      if (url) service.imageUrl = url;
    }

    await service.save();
    return res.json({ service });
  } catch (err) {
    console.error('Update service error:', err);
    return res.status(500).json({ message: 'Failed to update service listing', error: err.message });
  }
});

// Delete service listing (Soft delete)
router.delete('/:id', protect, authorize(['Service Provider', 'Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid service ID' });
    }

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ message: 'Service listing not found' });
    }

    // Verify ownership
    if (service.provider.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to delete this service listing' });
    }

    // Soft delete: set active to false
    service.active = false;
    await service.save();
    
    return res.json({ message: 'Service listing deleted successfully' });
  } catch (err) {
    console.error('Delete service error:', err);
    return res.status(500).json({ message: 'Failed to delete service listing', error: err.message });
  }
});

module.exports = router;
