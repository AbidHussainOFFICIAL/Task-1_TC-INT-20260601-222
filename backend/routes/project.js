const express = require('express');
const Project = require('../models/Project');
const Service = require('../models/Service');
const { protect } = require('../middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();

// Submit a new project/request (Authenticated users/Customers)
router.post('/', protect, async (req, res) => {
  const { serviceId, requirements, budget, deadline } = req.body;

  if (!serviceId || !requirements || budget === undefined || !deadline) {
    return res.status(400).json({ message: 'serviceId, requirements, budget, and deadline are required.' });
  }

  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({ message: 'Invalid service ID.' });
  }

  const numericBudget = Number(budget);
  if (isNaN(numericBudget) || numericBudget <= 0) {
    return res.status(400).json({ message: 'Budget must be a positive number.' });
  }

  const parsedDeadline = new Date(deadline);
  if (isNaN(parsedDeadline.getTime()) || parsedDeadline <= new Date()) {
    return res.status(400).json({ message: 'Deadline must be a valid future date.' });
  }

  try {
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    const project = await Project.create({
      customer: req.user.id,
      provider: service.provider,
      service: serviceId,
      requirements: requirements.trim(),
      budget: numericBudget,
      deadline: parsedDeadline,
      status: 'Pending',
    });

    return res.status(201).json({ project });
  } catch (err) {
    console.error('Create project request error:', err);
    return res.status(500).json({ message: 'Failed to submit service request.', error: err.message });
  }
});

// Get customer's own projects
router.get('/customer', protect, async (req, res) => {
  try {
    const projects = await Project.find({ customer: req.user.id })
      .populate('provider', 'name email')
      .populate('service', 'title category imageUrl')
      .sort({ createdAt: -1 });
    return res.json({ projects });
  } catch (err) {
    console.error('Fetch customer projects error:', err);
    return res.status(500).json({ message: 'Failed to retrieve your service requests.', error: err.message });
  }
});

// Get provider's received projects
router.get('/provider', protect, async (req, res) => {
  try {
    const projects = await Project.find({ provider: req.user.id })
      .populate('customer', 'name email')
      .populate('service', 'title category imageUrl')
      .sort({ createdAt: -1 });
    return res.json({ projects });
  } catch (err) {
    console.error('Fetch provider projects error:', err);
    return res.status(500).json({ message: 'Failed to retrieve received requests.', error: err.message });
  }
});

// Update status of project/request (Strict workflow)
router.patch('/:id/status', protect, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'New status is required.' });
  }

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid project ID.' });
  }

  const validStatuses = ['Pending', 'Accepted', 'In Progress', 'Completed', 'Delivered'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }

  try {
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project request not found.' });
    }

    const isCustomer = project.customer.toString() === req.user.id;
    const isProvider = project.provider.toString() === req.user.id;

    if (!isCustomer && !isProvider) {
      return res.status(403).json({ message: 'Not authorized to update this project.' });
    }

    const currentStatus = project.status;

    // Validate the strict progression and roles
    let allowed = false;
    if (currentStatus === 'Pending' && status === 'Accepted' && isProvider) {
      allowed = true;
    } else if (currentStatus === 'Accepted' && status === 'In Progress' && isProvider) {
      allowed = true;
    } else if (currentStatus === 'In Progress' && status === 'Completed' && isProvider) {
      allowed = true;
    } else if (currentStatus === 'Completed' && status === 'Delivered' && isCustomer) {
      allowed = true;
    }

    if (!allowed) {
      return res.status(400).json({ message: `Invalid status transition from ${currentStatus} to ${status} or unauthorized role.` });
    }

    project.status = status;
    await project.save();

    // Populate references for consistent response
    const updatedProject = await Project.findById(id)
      .populate('customer', 'name email')
      .populate('provider', 'name email')
      .populate('service', 'title category imageUrl');

    return res.json({ project: updatedProject });
  } catch (err) {
    console.error('Update status error:', err);
    return res.status(500).json({ message: 'Failed to update project status.', error: err.message });
  }
});

module.exports = router;
