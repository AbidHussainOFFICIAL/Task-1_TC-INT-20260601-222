const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Service = require('../models/Service');
const Review = require('../models/Review');
const Profile = require('../models/Profile');
const { protect } = require('../middleware/auth');

const router = express.Router();

const ACTIVE_STATUSES = ['Pending', 'Accepted', 'In Progress', 'Completed'];
const ALL_STATUSES = ['Pending', 'Accepted', 'In Progress', 'Completed', 'Delivered'];

async function getCustomerStats(userId) {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const [activeCount, completedCount, spendResult, recentProjects] = await Promise.all([
    Project.countDocuments({ customer: userObjectId, status: { $in: ACTIVE_STATUSES } }),
    Project.countDocuments({ customer: userObjectId, status: 'Delivered' }),
    Project.aggregate([
      { $match: { customer: userObjectId, status: 'Delivered' } },
      { $group: { _id: null, totalSpend: { $sum: '$budget' } } },
    ]),
    Project.find({ customer: userObjectId })
      .populate('provider', 'name email')
      .populate('service', 'title category imageUrl')
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  return {
    role: 'Customer',
    stats: {
      activeCount,
      completedCount,
      totalSpend: spendResult[0]?.totalSpend || 0,
    },
    recentProjects,
  };
}

async function getProviderStats(userId) {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const [earningsResult, activeCount, pendingCount, profile, recentProjects] = await Promise.all([
    Project.aggregate([
      { $match: { provider: userObjectId, status: 'Delivered' } },
      { $group: { _id: null, totalEarnings: { $sum: '$budget' } } },
    ]),
    Project.countDocuments({ provider: userObjectId, status: { $in: ['Accepted', 'In Progress', 'Completed'] } }),
    Project.countDocuments({ provider: userObjectId, status: 'Pending' }),
    Profile.findOne({ user: userObjectId }).select('averageRating reviewCount'),
    Project.find({ provider: userObjectId })
      .populate('customer', 'name email')
      .populate('service', 'title category imageUrl')
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  return {
    role: 'Service Provider',
    stats: {
      totalEarnings: earningsResult[0]?.totalEarnings || 0,
      activeCount,
      pendingCount,
      averageRating: profile?.averageRating ?? 0,
      reviewCount: profile?.reviewCount ?? 0,
    },
    recentProjects,
  };
}

async function getAdminStats() {
  const [
    totalUsers,
    customerCount,
    providerCount,
    adminCount,
    totalActiveServices,
    totalProjects,
    statusGroups,
    totalReviews,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'Customer' }),
    User.countDocuments({ role: 'Service Provider' }),
    User.countDocuments({ role: 'Admin' }),
    Service.countDocuments({ active: true }),
    Project.countDocuments(),
    Project.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Review.countDocuments(),
  ]);

  const projectsByStatus = ALL_STATUSES.reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {});

  statusGroups.forEach(({ _id, count }) => {
    if (_id in projectsByStatus) {
      projectsByStatus[_id] = count;
    }
  });

  return {
    role: 'Admin',
    stats: {
      totalUsers,
      customerCount,
      providerCount,
      adminCount,
      totalActiveServices,
      totalProjects,
      projectsByStatus,
      totalReviews,
    },
  };
}

router.get('/stats', protect, async (req, res) => {
  try {
    const { role } = req.user;

    if (role === 'Admin') {
      return res.json(await getAdminStats());
    }

    if (role === 'Service Provider') {
      return res.json(await getProviderStats(req.user.id));
    }

    return res.json(await getCustomerStats(req.user.id));
  } catch (err) {
    console.error('Dashboard stats error:', err);
    return res.status(500).json({ message: 'Failed to fetch dashboard stats.', error: err.message });
  }
});

module.exports = router;
