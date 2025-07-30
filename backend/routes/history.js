const express = require('express');
const auth = require('../middleware/auth');
const History = require('../models/History');

const router = express.Router();

// Save a new history record
router.post('/', auth, async (req, res) => {
  const { jobDescription, results } = req.body;
  if (!jobDescription || !Array.isArray(results)) {
    return res.status(400).json({ message: 'Missing jobDescription or results' });
  }
  try {
    const history = new History({
      user: req.user.userId,
      jobDescription,
      results,
    });
    await history.save();
    res.status(201).json({ message: 'History saved' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all history for the user
router.get('/', auth, async (req, res) => {
  try {
    const history = await History.find({ user: req.user.userId })
      .sort({ createdAt: -1 });
    res.json({ history });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 