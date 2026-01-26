const express = require('express');
const Event = require('../models/Event');
const { upload, uploadToCloudinary } = require('../config/cloudinary');
const router = express.Router();

const uploadFiles = upload.fields([
  { name: 'poster', maxCount: 1 },
  { name: 'logo', maxCount: 1 }
]);

// 1. CREATE EVENT (OPTIMIZED - PARALLEL UPLOAD)
router.post('/', uploadFiles, async (req, res) => {
    try {
      console.log("Starting Creation...");
      const startTime = Date.now();

      if (!req.files || !req.files.poster || !req.files.logo) {
        return res.status(400).json({ message: 'Error: Both Poster and Logo are required!' });
      }

      // OPTIMIZATION: Upload BOTH files at the same time (Parallel)
      const [posterRes, logoRes] = await Promise.all([
        uploadToCloudinary(req.files.poster[0].buffer),
        uploadToCloudinary(req.files.logo[0].buffer)
      ]);

      const { id, ...cleanData } = req.body; 

      const eventData = {
        ...cleanData,
        posterLink: posterRes.secure_url,
        logoLink: logoRes.secure_url
      };

      const event = new Event(eventData);
      await event.save();

      console.log(`Event Created in ${(Date.now() - startTime) / 1000}s`);
      res.status(201).json({ message: 'Event Created!', event });

    } catch (error) {
      console.error('Create Error:', error);
      res.status(500).json({ message: error.message });
    }
});

// 2. UPDATE EVENT (OPTIMIZED)
router.put('/:id', uploadFiles, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Update Text Data
    Object.keys(req.body).forEach(key => {
      if (key !== 'id' && req.body[key]) event[key] = req.body[key];
    });

    // Prepare upload promises array
    const uploadPromises = [];
    
    // If poster is new, add to queue
    if (req.files && req.files.poster) {
        uploadPromises.push(
            uploadToCloudinary(req.files.poster[0].buffer)
            .then(res => event.posterLink = res.secure_url)
        );
    }

    // If logo is new, add to queue
    if (req.files && req.files.logo) {
        uploadPromises.push(
            uploadToCloudinary(req.files.logo[0].buffer)
            .then(res => event.logoLink = res.secure_url)
        );
    }

    // Run all uploads in parallel
    if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
    }

    await event.save();
    res.json({ message: 'Event Updated!', event });

  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// 3. GET EVENTS (Optimized Query)
router.get('/', async (req, res) => {
  try {
    // .lean() makes query much faster (returns plain JSON instead of heavy Mongoose Objects)
    // .select() only fetches fields we need (optional, but good for speed)
    const { category, eventType } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (eventType) filter.eventType = eventType;

    const events = await Event.find(filter).sort({ createdAt: -1 }).lean();
    res.json({ count: events.length, events });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// 4. DELETE EVENT
router.delete('/:id', async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;