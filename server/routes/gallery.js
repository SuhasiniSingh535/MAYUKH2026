const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const { upload, uploadToCloudinary } = require('../config/cloudinary');

router.get('/', async (req, res) => {
  try {
    const photos = await Gallery.find().sort({ createdAt: -1 });
    res.json(photos);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });
    
    const result = await uploadToCloudinary(req.file.buffer, 'mayukh-gallery');
    
    const newPhoto = new Gallery({
      imageUrl: result.secure_url,
      caption: req.body.caption,
      category: req.body.category
    });
    await newPhoto.save();
    res.status(201).json(newPhoto);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  await Gallery.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;