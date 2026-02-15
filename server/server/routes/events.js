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

// --- 3. CREATE OR UPDATE EVENT ---
const cpUpload = upload.fields([{ name: 'poster', maxCount: 1 }, { name: 'logo', maxCount: 1 }]);

router.post('/', cpUpload, async (req, res) => {
    try {
        // 1. Clean up IDs
        if (req.body.id === '') delete req.body.id;
        if (req.body._id === '') delete req.body._id;

        /// 2. Handle Images (Priority: New File > Existing Link > Empty)
        let posterUrl = req.body.existingPoster || '';
        let logoUrl = req.body.existingLogo || '';
        let posterPublicId = req.body.posterPublicId || ''; 
        let logoPublicId = req.body.logoPublicId || '';

        if (req.files && req.files['poster']) {
            posterUrl = req.files['poster'][0].path;
            posterPublicId = req.files['poster'][0].filename; 
        }

        if (req.files && req.files['logo']) {
            logoUrl = req.files['logo'][0].path;
            logoPublicId = req.files['logo'][0].filename;
        }

        // 3. Prepare Event Data (Explicit mapping)
        const eventData = {
            title: req.body.title,
            category: req.body.category,
            eventType: req.body.eventType,
            description: req.body.description,
            rounds: req.body.rounds,
            requirements: req.body.requirements,
            day: req.body.day,
            date: req.body.date,
            venue: req.body.venue,
            time: req.body.time,
            duration: req.body.duration,
            teamSize: req.body.teamSize,
            prizePool: req.body.prizePool,
            registrationFee: req.body.registrationFee,
            registrationLink: req.body.registrationLink,
            posterLink: posterUrl, // Purana link retain hoga agar naya nahi aaya
            logoLink: logoUrl,
            posterPublicId: posterPublicId,
            logoPublicId: logoPublicId
        };

        // 4. Update Existing OR Create New
        if (req.body.id || req.body._id) {
            const id = req.body.id || req.body._id;
            const updatedEvent = await Event.findByIdAndUpdate(id, eventData, { new: true });
            console.log("✅ Event Updated:", updatedEvent.title);
            res.json(updatedEvent);
        } else {
            const newEvent = new Event(eventData);
            await newEvent.save();
            console.log("✅ New Event Created:", newEvent.title);
            res.status(201).json(newEvent);
        }

    } catch (err) {
        console.error("POST Event Error:", err);
        res.status(500).json({ message: 'Error saving event', error: err.message });
    }
});

// Events update karne ke liye PUT route
router.put('/:id', upload.fields([
    { name: 'poster', maxCount: 1 }, 
    { name: 'logo', maxCount: 1 }
]), async (req, res) => {
    try {
        // Capture existing links from the hidden fields sent in req.body
        let posterUrl = req.body.existingPoster;
        let logoUrl = req.body.existingLogo;

        // If a NEW file is uploaded, use the new path, otherwise keep the old one
        if (req.files && req.files['poster']) {
            posterUrl = req.files['poster'][0].path;
        }
        if (req.files && req.files['logo']) {
            logoUrl = req.files['logo'][0].path;
        }

        // Construct the update object explicitly to avoid data loss
        const updateData = { 
            ...req.body,
            posterLink: posterUrl,
            logoLink: logoUrl
        };

        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
        
        if (!updatedEvent) return res.status(404).json({ message: "Event not found" });
        res.json(updatedEvent);
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ message: error.message });
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