const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const { upload, uploadToCloudinary } = require('../config/cloudinary');

router.get('/', async (req, res) => {
  try {
    // Sort by Team Name so they render nicely in groups
    const members = await Team.find().sort({ teamName: 1 });
    res.json(members);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

    const result = await uploadToCloudinary(req.file.buffer, 'mayukh-teams');

    const newMember = new Team({
      name: req.body.name,
      teamName: req.body.teamName, // Technical, PR, etc.
      memberType: req.body.memberType, // Core or Sub-Core
      imageUrl: result.secure_url,
      linkedin: req.body.linkedin
    });

    await newMember.save();
    res.status(201).json(newMember);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  await Team.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;