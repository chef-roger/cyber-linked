const router = require('express').Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Search users
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ],
      _id: { $ne: req.user._id },
    }).select('-password').limit(20);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get friends list
router.get('/friends', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', '-password');
    res.json(user.friends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send friend request
router.post('/friends/request/:userId', auth, async (req, res) => {
  try {
    const target = await User.findById(req.params.userId);
    if (!target) return res.status(404).json({ error: 'User not found' });
    if (target.friendRequests.includes(req.user._id))
      return res.status(400).json({ error: 'Request already sent' });
    if (target.friends.includes(req.user._id))
      return res.status(400).json({ error: 'Already friends' });

    await User.findByIdAndUpdate(req.params.userId, {
      $addToSet: { friendRequests: req.user._id },
    });
    res.json({ message: 'Friend request sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Accept friend request
router.post('/friends/accept/:userId', auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { friends: req.params.userId },
      $pull: { friendRequests: req.params.userId },
    });
    await User.findByIdAndUpdate(req.params.userId, {
      $addToSet: { friends: req.user._id },
    });
    res.json({ message: 'Friend accepted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get friend requests
router.get('/friends/requests', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friendRequests', '-password');
    res.json(user.friendRequests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user profile
router.get('/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
