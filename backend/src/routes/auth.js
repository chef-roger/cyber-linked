const router = require('express').Router();
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: 'All fields required' });

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(409).json({ error: 'Username or email already taken' });

    const user = await User.create({ username, email, password });
    const token = generateToken(user._id);
    res.status(201).json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    await User.findByIdAndUpdate(user._id, { status: 'online' });
    const token = generateToken(user._id);
    res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logout
router.post('/logout', require('../middleware/auth').auth, async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { status: 'offline' });
  res.json({ message: 'Logged out' });
});

// Me
router.get('/me', require('../middleware/auth').auth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
