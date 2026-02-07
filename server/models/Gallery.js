const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
    description: "Base64 string or path to the uploaded image"
  },
  category: {
    type: String,
    default: 'theme', // 'theme', 'event', 'campus', etc.
  },
  title: {
    type: String,
    trim: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Gallery', gallerySchema);