const express = require('express');
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Project = require('../models/Project');
const Profile = require('../models/Profile');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// POST /api/reviews — Submit a review (Customer only, project must be Delivered)
router.post('/', protect, authorize(['Customer']), async (req, res) => {
  const { projectId, rating, feedback } = req.body;

  // --- Validation ---
  if (!projectId || rating === undefined || !feedback) {
    return res.status(400).json({ message: 'projectId, rating, and feedback are required.' });
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({ message: 'Invalid project ID.' });
  }

  const numRating = Number(rating);
  if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
    return res.status(400).json({ message: 'Rating must be an integer between 1 and 5.' });
  }

  if (typeof feedback !== 'string' || feedback.trim().length === 0) {
    return res.status(400).json({ message: 'Feedback cannot be empty.' });
  }

  try {
    // --- Fetch & verify project ---
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    if (project.status !== 'Delivered') {
      return res.status(400).json({ message: 'Reviews can only be submitted for Delivered projects.' });
    }

    if (project.customer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the customer of this project can submit a review.' });
    }

    // --- Duplicate check ---
    const existing = await Review.findOne({ project: projectId });
    if (existing) {
      return res.status(409).json({ message: 'A review has already been submitted for this project.' });
    }

    // --- Create review ---
    const review = await Review.create({
      project: projectId,
      customer: req.user.id,
      provider: project.provider,
      rating: numRating,
      feedback: feedback.trim(),
    });

    // --- Recalculate provider's average rating ---
    const allProviderReviews = await Review.find({ provider: project.provider });
    const newCount = allProviderReviews.length;
    const newAverage =
      newCount > 0
        ? Math.round((allProviderReviews.reduce((sum, r) => sum + r.rating, 0) / newCount) * 10) / 10
        : 0;

    await Profile.findOneAndUpdate(
      { user: project.provider },
      { averageRating: newAverage, reviewCount: newCount }
    );

    return res.status(201).json({ review });
  } catch (err) {
    // Handle MongoDB unique-index violation (race condition safety net)
    if (err.code === 11000) {
      return res.status(409).json({ message: 'A review has already been submitted for this project.' });
    }
    console.error('Submit review error:', err);
    return res.status(500).json({ message: 'Failed to submit review.', error: err.message });
  }
});

// GET /api/reviews/provider/:userId — Public: all reviews for a provider
router.get('/provider/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID.' });
  }

  try {
    const reviews = await Review.find({ provider: userId })
      .populate('customer', 'name')
      .sort({ createdAt: -1 });

    return res.json({ reviews });
  } catch (err) {
    console.error('Fetch provider reviews error:', err);
    return res.status(500).json({ message: 'Failed to fetch reviews.', error: err.message });
  }
});

module.exports = router;
