const mongoose = require('mongoose');

const SnippetSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  content: { type: String, default: '' },
  language: { type: String, default: 'javascript' },
  title: { type: String, default: 'Untitled Snippet' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  visibility: { type: String, enum: ['public', 'unlisted', 'private'], default: 'public' },
  expiresAt: { type: Date },
  readOnly: { type: Boolean, default: false },
  forkOf: { type: String },
  viewCount: { type: Number, default: 0 },
  maxViews: { type: Number, default: 0 }, // 0 = unlimited
  createdAt: { type: Date, default: Date.now }
});

// TTL Index for expiration
SnippetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Snippet', SnippetSchema);
