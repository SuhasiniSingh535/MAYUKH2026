const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  caption: { type: String, trim: true },
  category: { 
    type: String, 
    default: 'fest',
    enum: ['fest', 'spy-verse', 'scifi-verse', 'carnival-verse', 'dark-verse', 'mythic-verse']
  }
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);