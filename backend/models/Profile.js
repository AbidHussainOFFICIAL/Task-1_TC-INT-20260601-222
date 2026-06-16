const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    company: { type: String, trim: true },
    period: { type: String, trim: true },
    description: { type: String, trim: true },
  },
  { _id: false }
);

const portfolioSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    url: { type: String, trim: true },
  },
  { _id: false }
);

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: 'User',
    },
    headline: {
      type: String,
      trim: true,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    profilePictureUrl: {
      type: String,
      trim: true,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    experience: {
      type: [experienceSchema],
      default: [],
    },
    pricing: {
      hourlyRate: { type: Number },
      startingPrice: { type: Number },
      summary: { type: String, trim: true, default: '' },
    },
    portfolio: {
      type: [portfolioSchema],
      default: [],
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Profile', profileSchema);
