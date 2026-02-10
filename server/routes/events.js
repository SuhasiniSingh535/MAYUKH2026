const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// --- 1. INDEPENDENT CONFIGURATION (Fixes the conflict) ---
// We configure Cloudinary manually here so we don't break teams.js
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'mayukh_events', // Events go to their own folder
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
    }
});
const upload = multer({ storage: storage });

// --- 2. GET ALL EVENTS ---
router.get('/', async (req, res) => {
    try {
        const events = await Event.find().sort({ createdAt: -1 });
        res.json(events);
    } catch (err) {
        console.error("GET Error:", err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// --- 3. CREATE EVENT ---
const cpUpload = upload.fields([{ name: 'poster', maxCount: 1 }, { name: 'logo', maxCount: 1 }]);

router.post('/', cpUpload, async (req, res) => {
    try {
        // Extract text fields
        const { 
            title, category, eventType, description, 
            day, date, venue, time, duration, teamSize, 
            prizePool, registrationFee, registrationLink 
        } = req.body;

        // Extract image links
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
            title, category, eventType, description,
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

// --- 4. DELETE EVENT ---
router.delete('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        // Cleanup images
        if (event.posterPublicId) await cloudinary.uploader.destroy(event.posterPublicId);
        if (event.logoPublicId) await cloudinary.uploader.destroy(event.logoPublicId);

        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: 'Event deleted' });
    } catch (err) {
        console.error("DELETE Error:", err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

module.exports = router;