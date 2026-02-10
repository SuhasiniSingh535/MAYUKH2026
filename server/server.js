const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { Readable } = require('stream');

const app = express();
const PORT = process.env.PORT || 5001;

// ==========================================
// 1. CONFIGURATION
// ==========================================

app.use(cors({ origin: '*' })); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// MongoDB Connection
const db_url = process.env.MONGODB_URI;
mongoose.connect(db_url)
    .then(() => console.log('\n✅ MONGODB CONNECTED SUCCESSFULLY!'))
    .catch(err => {
        console.error('\n❌ MONGODB CONNECTION FAILED!');
        console.error('Reason:', err.message);
    });

// File Upload Helper
const upload = multer({ storage: multer.memoryStorage() });
const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: folder, resource_type: 'image' },
            (err, res) => err ? reject(err) : resolve(res)
        );
        Readable.from(buffer).pipe(stream);
    });
};

// ==========================================
// 2. DATABASE MODELS (CORRECTED)
// ==========================================

const Event = mongoose.model('Event', new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, default: 'all-verses' },
    eventType: { type: String, default: 'tech-event' },
    description: String,
    posterLink: String,
    logoLink: String,
    venue: String,
    date: String,
    time: String,
    registrationLink: String,
    duration: String,
    teamSize: String,
    prizePool: String,
    registrationFee: String,
    day: String
}, { timestamps: true }));

// 🔥 FIXED: 'name' ab required nahi hai. Default value 'Member' hai agar khali chhoda toh.
const Team = mongoose.model('Team', new mongoose.Schema({
    name: { type: String, default: "Member" }, 
    teamName: { type: String, required: true },
    memberType: { type: String, required: true },
    imageUrl: String,
    linkedin: String
}, { timestamps: true }));

const Gallery = mongoose.model('Gallery', new mongoose.Schema({
    imageUrl: String,
    caption: { type: String, default: "" }, // Optional
    category: String
}, { timestamps: true }));

// ==========================================
// 3. API ROUTES
// ==========================================

// --- EVENTS ---
app.get('/api/events', async (req, res) => {
    try {
        const events = await Event.find().sort({ createdAt: -1 });
        res.json({ events }); 
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/events', upload.fields([{name: 'poster'}, {name: 'logo'}]), async (req, res) => {
    try {
        if (req.body.id === '') delete req.body.id;
        if (req.body._id === '') delete req.body._id;

        let posterUrl = '', logoUrl = '';
        if (req.files?.poster) {
            const up = await uploadToCloudinary(req.files.poster[0].buffer, 'mayukh-events');
            posterUrl = up.secure_url;
        }
        if (req.files?.logo) {
            const up = await uploadToCloudinary(req.files.logo[0].buffer, 'mayukh-events');
            logoUrl = up.secure_url;
        }

        const newEvent = await new Event({ 
            ...req.body, 
            posterLink: posterUrl, 
            logoLink: logoUrl 
        }).save();
        
        res.json(newEvent);
    } catch (e) { 
        console.error("POST EVENT ERROR:", e.message);
        res.status(500).json({ error: e.message }); 
    }
});

app.delete('/api/events/:id', async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- TEAMS (No Validation Error) ---
app.get('/api/teams', async (req, res) => {
    try {
        const teams = await Team.find().sort({ teamName: 1 });
        res.json(teams);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/teams', upload.single('image'), async (req, res) => {
    try {
        if (req.body.id === '') delete req.body.id;
        if (req.body._id === '') delete req.body._id;

        // Image Logic: Agar nayi file hai toh upload, nahi toh purani use karo
        let imgUrl = req.body.existingImage || '';
        
        if (req.file) {
            console.log("Uploading new team photo...");
            const uploaded = await uploadToCloudinary(req.file.buffer, 'mayukh-teams');
            imgUrl = uploaded.secure_url;
        }

        // Agar image abhi bhi khali hai (na nayi, na purani), toh error do
        if (!imgUrl) {
             return res.status(400).json({ message: 'Image is required' });
        }
        
        const newMember = await new Team({
            name: req.body.name, // Required removed
            teamName: req.body.teamName,
            memberType: req.body.memberType,
            linkedin: req.body.linkedin,
            imageUrl: imgUrl
        }).save();
        
        res.json(newMember);
    } catch (e) { 
        console.error("POST TEAM ERROR:", e.message);
        res.status(500).json({ error: e.message }); 
    }
});

app.delete('/api/teams/:id', async (req, res) => {
    try {
        await Team.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- GALLERY ---
app.get('/api/gallery', async (req, res) => {
    try {
        const photos = await Gallery.find().sort({ createdAt: -1 });
        res.json(photos);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/gallery', upload.single('image'), async (req, res) => {
    try {
        if (req.body.id === '') delete req.body.id;
        if (req.body._id === '') delete req.body._id;

        let imgUrl = req.body.existingImage || '';

        if (req.file) {
            const img = await uploadToCloudinary(req.file.buffer, 'mayukh-gallery');
            imgUrl = img.secure_url;
        } 
        
        if (!imgUrl) {
            return res.status(400).json({ msg: "Image required" });
        }
        
        const newPhoto = await new Gallery({
            imageUrl: imgUrl,
            caption: req.body.caption, 
            category: req.body.category
        }).save();
        res.json(newPhoto);
    } catch (e) { 
        console.error("POST GALLERY ERROR:", e.message);
        res.status(500).json({ error: e.message }); 
    }
});

app.delete('/api/gallery/:id', async (req, res) => { 
    try {
        await Gallery.findByIdAndDelete(req.params.id); 
        res.json({ success: true }); 
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- SERVER START ---
app.listen(PORT, () => {
    console.log(`\n🚀 SERVER STARTED ON PORT: ${PORT}`);
    console.log(`📡 Waiting for Database connection...\n`);
});