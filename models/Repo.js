const mongoose = require('mongoose');

const repoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tagline: { type: String, required: true },
  category: { type: String, required: true },
  stack: [{ type: String }], // Array of strings
  stars: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
  isTopPick: { type: Boolean, default: false },
  githubUrl: { type: String, required: true },
  deepWikiUrl: { type: String, required: true }
});

module.exports = mongoose.model('Repo', repoSchema);