const express = require('express');
const User = require('../models/User');
const Snippet = require('../models/Snippet');
const auth = require('../middleware/auth');
const router = express.Router();

// Get profile by username
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() })
      .select('-passwordHash');

    if (!user) return res.status(404).json({ error: 'User not found' });

    const snippets = await Snippet.find({ author: user._id })
      .sort({ createdAt: -1 });

    res.json({ user, snippets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update profile
router.patch('/:username', auth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Verify ownership
    if (user._id.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized to update this profile' });
    }

    const { username, bio, skills, location, website, github, twitter, avatarColor } = req.body;

    // Check username uniqueness if changed
    if (username && username.toLowerCase() !== user.username) {
      const existing = await User.findOne({ username: username.toLowerCase() });
      if (existing) return res.status(400).json({ error: 'Username already taken' });
      user.username = username.toLowerCase();
    }

    if (bio !== undefined) user.bio = bio;
    if (skills !== undefined) user.skills = skills;
    if (location !== undefined) user.location = location;
    if (website !== undefined) user.website = website;
    if (github !== undefined) user.github = github;
    if (twitter !== undefined) user.twitter = twitter;
    if (avatarColor !== undefined) user.avatarColor = avatarColor;

    await user.save();

    const updatedUser = {
      id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      skills: user.skills,
      location: user.location,
      website: user.website,
      github: user.github,
      twitter: user.twitter,
      avatarColor: user.avatarColor,
      createdAt: user.createdAt
    };

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
