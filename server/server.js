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


const allowedOrigins = [
    "http://localhost:5001",
    "http://127.0.0.1:5001",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "https://mayukh2026.netlify.app",
    "https://mayukh-bv-1.onrender.com"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log("Blocked by CORS:", origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
})); 
app.use(express.json());
// Isse admin.html aur media.html load hone lagenge
app.use(express.static(path.join(__dirname, '../')));
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
    rounds: String,
    requirements: String,
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
    name: { type: String, default: "" }, 
    teamName: { type: String, required: true },
    memberType: { type: String, default: "Member" },
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

// --- CREATE OR UPDATE EVENT ---
app.post('/api/events', upload.fields([{name: 'poster'}, {name: 'logo'}]), async (req, res) => {
    try {
        // 1. Clean up IDs to avoid duplicate key errors
        if (req.body.id === '' || req.body.id === 'undefined') delete req.body.id;
        if (req.body._id === '' || req.body._id === 'undefined') delete req.body._id;

        // 2. Handle Images (Priority: New Upload > Existing Hidden Field > Empty)
        let posterUrl = req.body.existingPoster || ''; 
        let logoUrl = req.body.existingLogo || '';

        // Check if New Poster is Uploaded
        if (req.files && req.files['poster']) {
            console.log("📤 Uploading New Poster...");
            const up = await uploadToCloudinary(req.files['poster'][0].buffer, 'mayukh-events');
            posterUrl = up.secure_url;
        }

        // Check if New Logo is Uploaded
        if (req.files && req.files['logo']) {
            console.log("📤 Uploading New Logo...");
            const up = await uploadToCloudinary(req.files['logo'][0].buffer, 'mayukh-events');
            logoUrl = up.secure_url;
        }

        // 3. Prepare Final Data Object
        const eventData = {
            ...req.body, // Gets title, description, rounds, requirements etc.
            posterLink: posterUrl,
            logoLink: logoUrl
        };

        // 4. Update Existing OR Create New Logic
        if (req.body.id || req.body._id) {
            // --- UPDATE CASE ---
            const id = req.body.id || req.body._id;
            const updatedEvent = await Event.findByIdAndUpdate(id, eventData, { new: true });
            console.log("✅ Event Updated:", updatedEvent.title);
            res.json(updatedEvent);
        } else {
            // --- CREATE CASE ---
            // Naye event mein agar poster nahi hai toh warning, but crash nahi hoga
            const newEvent = new Event(eventData);
            await newEvent.save();
            console.log("✅ New Event Created:", newEvent.title);
            res.status(201).json(newEvent);
        }

    } catch (err) {
        console.error("❌ POST Event Error:", err.message);
        // Returns exact error to your browser console so you know what failed
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// --- UPDATE EXISTING EVENT (Dedicated PUT route) ---
app.put('/api/events/:id', upload.fields([{name: 'poster'}, {name: 'logo'}]), async (req, res) => {
    try {
        const id = req.params.id;
        
        // 1. Purani images retain karne ke liye logic
        let posterUrl = req.body.existingPoster || ''; 
        let logoUrl = req.body.existingLogo || '';

        // 2. Agar nayi files upload hui hain toh unhe use karo
        if (req.files && req.files['poster']) {
            const up = await uploadToCloudinary(req.files['poster'][0].buffer, 'mayukh-events');
            posterUrl = up.secure_url;
        }
        if (req.files && req.files['logo']) {
            const up = await uploadToCloudinary(req.files['logo'][0].buffer, 'mayukh-events');
            logoUrl = up.secure_url;
        }

        // 3. Data prepare karein
        const eventData = {
            ...req.body,
            posterLink: posterUrl,
            logoLink: logoUrl
        };

        // 4. Database update karein
        const updatedEvent = await Event.findByIdAndUpdate(id, eventData, { new: true });
        
        if (!updatedEvent) return res.status(404).json({ message: "Event not found" });
        
        console.log("✅ Event Updated Successfully:", updatedEvent.title);
        res.json(updatedEvent);
    } catch (err) {
        console.error("❌ PUT Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// --- 1. POST: CREATE TEAM (Simplified) ---
app.post('/api/teams', upload.single('image'), async (req, res) => {
    try {
        let imgUrl = "";
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, 'mayukh-teams');
            imgUrl = result.secure_url;
        }

        const newMember = new Team({
            name: req.body.name || "Team Photo", // Yeh aapka caption ban jayega
            teamName: req.body.teamName,
            imageUrl: imgUrl
            // LinkedIn aur memberType automatic default set ho jayenge
        });

        await newMember.save();
        res.status(201).json(newMember);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- 2. PUT: UPDATE TEAM (Simplified) ---
app.put('/api/teams/:id', upload.single('image'), async (req, res) => {
    try {
        const id = req.params.id;
        let updateData = {
            name: req.body.name,
            teamName: req.body.teamName
        };

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, 'mayukh-teams');
            updateData.imageUrl = result.secure_url;
        } else {
            updateData.imageUrl = req.body.existingImage;
        }

        const updated = await Team.findByIdAndUpdate(id, updateData, { new: true });
        res.json(updated);
    } catch (e) {
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

// --- UPDATE GALLERY PHOTO ---
app.put('/api/gallery/:id', upload.single('image'), async (req, res) => {
    try {
        const id = req.params.id;
        let updateData = {
            caption: req.body.caption,
            category: req.body.category
        };

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, 'mayukh-gallery');
            updateData.imageUrl = result.secure_url;
        } else {
            updateData.imageUrl = req.body.existingImage;
        }

        const updatedPhoto = await Gallery.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedPhoto) return res.status(404).json({ error: "Photo not found" });

        console.log("✅ Gallery Photo Updated");
        res.json(updatedPhoto);
    } catch (e) {
        console.error("UPDATE GALLERY ERROR:", e.message);
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/gallery/:id', async (req, res) => { 
    try {
        await Gallery.findByIdAndDelete(req.params.id); 
        res.json({ success: true }); 
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ==========================================
// 4. EVENT ALERT SYSTEM (ADVANCED)
// ==========================================

const EventAlert = mongoose.model('EventAlert', new mongoose.Schema({
    eventName: { type: String, required: true },
    changes: {
        venue: String,
        time: String,
        date: String,
        fees: String,
        note: String
    }
}, { timestamps: true }));

// Get all active alerts
app.get('/api/event-alerts', async (req, res) => {
    try {
        const alerts = await EventAlert.find().sort({ createdAt: -1 });
        res.json(alerts);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Create a new Alert
app.post('/api/event-alerts', async (req, res) => {
    try {
        const newAlert = await new EventAlert({
            eventName: req.body.eventName,
            changes: {
                venue: req.body.venue,
                time: req.body.time,
                date: req.body.date,
                fees: req.body.fees,
                note: req.body.note
            }
        }).save();
        res.json(newAlert);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Delete an Alert
app.delete('/api/event-alerts/:id', async (req, res) => {
    try {
        await EventAlert.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Update/Edit an existing Alert
app.put('/api/event-alerts/:id', async (req, res) => {
    try {
        const updatedAlert = await EventAlert.findByIdAndUpdate(
            req.params.id,
            {
                eventName: req.body.eventName,
                changes: {
                    venue: req.body.venue,
                    time: req.body.time,
                    date: req.body.date,
                    fees: req.body.fees,
                    note: req.body.note
                }
            },
            { new: true } // Return the updated document
        );
        res.json(updatedAlert);
    } catch (e) { res.status(500).json({ error: e.message }); }
});


// --- SERVER START ---
app.listen(PORT, () => {
    console.log(`\n SERVER STARTED ON PORT: ${PORT}`);
    console.log(`📡 Waiting for Database connection...\n`);
});