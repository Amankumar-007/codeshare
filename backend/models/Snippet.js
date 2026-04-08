const mongoose = require('mongoose');

const SnippetSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  content: { type: String, default: '' },
  language: { type: String, default: 'javascript' },
  files: [{
    id: { type: String, default: () => Math.random().toString(36).substr(2, 9) },
    name: { type: String, default: 'main.js' },
    content: { type: String, default: '' },
    language: { type: String, default: 'javascript' }
  }],
  title: { type: String, default: 'Untitled Snippet' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  visibility: { type: String, enum: ['public', 'unlisted', 'private'], default: 'public' },
  expiresAt: { type: Date },
  readOnly: { type: Boolean, default: false },
  forkOf: { type: String },
  viewCount: { type: Number, default: 0 },
  maxViews: { type: Number, default: 0 }, // 0 = unlimited
  uploads: [{
    url: { type: String, required: true },
    name: { type: String, default: 'Asset' },
    public_id: { type: String },
    resource_type: { type: String, default: 'image' },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

// TTL Index for expiration
SnippetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Snippet', SnippetSchema);
