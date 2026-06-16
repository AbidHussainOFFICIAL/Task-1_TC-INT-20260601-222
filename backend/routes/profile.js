const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const Profile = require('../models/Profile');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();
const upload = multer(); // memory storage

async function uploadToCloudinary(file) {
  if (!file) return null;
  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  const res = await cloudinary.uploader.upload(dataUri, { folder: 'profiles' });
  return res.secure_url;
}

const conditionalUpload = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    return upload.single('picture')(req, res, next);
  }
  return next();
};

const parseArrayField = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'object') return Object.values(val).flat();
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      // not JSON, fall back to comma split
    }
    return val.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

const parseObjectField = (val) => {
  if (!val) return {};
  if (typeof val === 'object') return val;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch (e) {
      return {};
    }
  }
  return {};
};

// Create or update profile (providers)
router.post('/', protect, authorize(['Service Provider', 'Admin']), conditionalUpload, async (req, res) => {
  try {
    const uid = req.user.id;
    if (!uid || !mongoose.Types.ObjectId.isValid(uid)) {
      console.warn('Invalid user id on profile create/update:', uid);
      return res.status(400).json({ message: 'Invalid authenticated user id' });
    }
    const body = req.body || {};

    const profileData = {
      headline: body.headline || '',
      bio: body.bio || '',
      skills: parseArrayField(body.skills),
      experience: parseArrayField(body.experience),
      pricing: parseObjectField(body.pricing),
      portfolio: parseArrayField(body.portfolio),
    };

    if (req.file) {
      const url = await uploadToCloudinary(req.file);
      if (url) profileData.profilePictureUrl = url;
    }

    let profile = await Profile.findOne({ user: uid });
    if (profile) {
      profile = Object.assign(profile, profileData);
      await profile.save();
    } else {
      profile = await Profile.create(Object.assign({ user: uid }, profileData));
    }

    return res.json({ profile });
  } catch (err) {
    console.error('Profile save error:', err && err.stack ? err.stack : err);
    return res.status(500).json({ message: 'Failed to save profile', error: err?.message });
  }
});

// Upload only photo
router.post('/photo', protect, authorize(['Service Provider', 'Admin']), upload.single('picture'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' });
    if (!req.user?.id || !mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ message: 'Invalid authenticated user id' });
    }
    const url = await uploadToCloudinary(req.file);
    if (!url) throw new Error('Upload failed');
    let profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      profile = await Profile.create({ user: req.user.id, profilePictureUrl: url });
    } else {
      profile.profilePictureUrl = url;
      await profile.save();
    }
    return res.json({ url, profile });
  } catch (err) {
    console.error('Photo upload error:', err && err.stack ? err.stack : err);
    return res.status(500).json({ message: 'Photo upload failed', error: err?.message });
  }
});

// Get my profile (protected)
router.get('/me', protect, async (req, res) => {
  try {
    if (!req.user?.id || !mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(400).json({ message: 'Invalid authenticated user id' });
    }
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', 'name email role');
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    return res.json({ profile });
  } catch (err) {
    console.error('Fetch my profile error:', err && err.stack ? err.stack : err);
    return res.status(500).json({ message: 'Unable to fetch profile', error: err?.message });
  }
});

// Public profile by userId
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId parameter' });
    }
    const profile = await Profile.findOne({ user: userId }).populate('user', 'name role');
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    return res.json({ profile });
  } catch (err) {
    console.error('Fetch public profile error:', err && err.stack ? err.stack : err);
    return res.status(500).json({ message: 'Unable to fetch profile', error: err?.message });
  }
});

module.exports = router;
