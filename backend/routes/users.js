const express = require('express');
const User = require('../models/User');
const Snippet = require('../models/Snippet');
const router = express.Router();

// Get profile by username
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() })
      .select('-passwordHash');
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Find snippets by this user (Phase 3 will add authorId, for now we can filter by titles or custom IDs if needed, 
    // but better to add author reference to Snippet model now)
    const snippets = await Snippet.find({ author: user._id })
      .sort({ createdAt: -1 });

    res.json({ user, snippets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
