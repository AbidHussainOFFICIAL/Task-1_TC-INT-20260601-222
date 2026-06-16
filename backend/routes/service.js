const express = require('express');
const Service = require('../models/Service');
const { protect, authorize } = require('../middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();

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
router.post('/', protect, authorize(['Service Provider', 'Admin']), async (req, res) => {
  const { title, description, category, price, deliveryTime } = req.body;
  if (!title || !description || !category || price === undefined || !deliveryTime) {
    return res.status(400).json({ message: 'All fields (title, description, category, price, deliveryTime) are required.' });
  }

  try {
    const service = await Service.create({
      provider: req.user.id,
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      price: Number(price),
      deliveryTime: Number(deliveryTime),
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
    const services = await Service.find().populate('provider', 'name email');
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
router.put('/:id', protect, authorize(['Service Provider', 'Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid service ID' });
    }

    const { title, description, category, price, deliveryTime } = req.body;
    let service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({ message: 'Service listing not found' });
    }

    // Verify ownership
    if (service.provider.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to update this service listing' });
    }

    if (title) service.title = title.trim();
    if (description) service.description = description.trim();
    if (category) service.category = category.trim();
    if (price !== undefined) service.price = Number(price);
    if (deliveryTime) service.deliveryTime = Number(deliveryTime);

    await service.save();
    return res.json({ service });
  } catch (err) {
    console.error('Update service error:', err);
    return res.status(500).json({ message: 'Failed to update service listing', error: err.message });
  }
});

// Delete service listing
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

    await Service.findByIdAndDelete(id);
    return res.json({ message: 'Service listing deleted successfully' });
  } catch (err) {
    console.error('Delete service error:', err);
    return res.status(500).json({ message: 'Failed to delete service listing', error: err.message });
  }
});

module.exports = router;
