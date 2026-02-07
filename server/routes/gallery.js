const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');

// Get all gallery images
router.get('/', async (req, res) => {
  try {
    const images = await Gallery.find().sort({ uploadedAt: -1 });
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload new image
router.post('/upload', async (req, res) => {
  const photo = new Gallery({
    imageUrl: req.body.image,
    category: req.body.category || 'theme',
    title: req.body.title
  });
  try {
    const newPhoto = await photo.save();
    res.status(201).json(newPhoto);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete image
router.delete('/:id', async (req, res) => {
  try {
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ message: 'Photo deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;