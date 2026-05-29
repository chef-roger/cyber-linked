const router = require('express').Router();
const Message = require('../models/Message');
const { auth } = require('../middleware/auth');

// Get conversation with a user
router.get('/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'username avatar')
      .populate('receiver', 'username avatar')
      .limit(100);

    // Mark messages as read
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user._id, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send message (REST fallback)
router.post('/:userId', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });

    const message = await Message.create({
      sender: req.user._id,
      receiver: req.params.userId,
      content,
    });
    await message.populate('sender', 'username avatar');
    await message.populate('receiver', 'username avatar');
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
