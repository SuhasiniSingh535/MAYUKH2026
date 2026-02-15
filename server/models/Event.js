const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// 1. Storage Setup
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'mayukh_events',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
    }
});
const upload = multer({ storage: storage });

// 2. GET ALL EVENTS (This fixes your 500 error)
router.get('/', async (req, res) => {
    try {
        const events = await Event.find().sort({ createdAt: -1 });
        res.json(events);
    } catch (err) {
        console.error("GET Error:", err);
        res.status(500).json({ message: 'Server Error fetching events', error: err.message });
    }
});

// 3. CREATE/SAVE EVENT
const cpUpload = upload.fields([{ name: 'poster', maxCount: 1 }, { name: 'logo', maxCount: 1 }]);

router.post('/', cpUpload, async (req, res) => {
    try {
        const { 
            title, category, eventType, description,rounds, requirements,   
            day, date, venue, time, duration, teamSize, 
            prizePool, registrationFee, registrationLink 
        } = req.body;

        let posterLink = '', posterPublicId = '';
        let logoLink = '', logoPublicId = '';

        if (req.files['poster']) {
            posterLink = req.files['poster'][0].path;
            posterPublicId = req.files['poster'][0].filename;
        }

        if (req.files['logo']) {
            logoLink = req.files['logo'][0].path;
            logoPublicId = req.files['logo'][0].filename;
        }

        const newEvent = new Event({
            title, category, eventType, description,rounds, requirements,
            day, date, venue, time, duration, teamSize,
            prizePool, registrationFee, registrationLink,
            posterLink, posterPublicId,
            logoLink, logoPublicId
        });

        await newEvent.save();
        res.status(201).json(newEvent);

    } catch (err) {
        console.error("POST Error:", err);
        res.status(500).json({ message: 'Error saving event', error: err.message });
    }
});

// 4. DELETE EVENT
router.delete('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (event.posterPublicId) await cloudinary.uploader.destroy(event.posterPublicId);
        if (event.logoPublicId) await cloudinary.uploader.destroy(event.logoPublicId);

        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        console.error("DELETE Error:", err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

module.exports = router;