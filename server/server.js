<<<<<<< HEAD
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
=======
const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
>>>>>>> cacb304b89ff9a7114f80afc0a20b2e02c8ac57c

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
<<<<<<< HEAD
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { Readable } = require('stream');
=======
const path = require('path');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
>>>>>>> cacb304b89ff9a7114f80afc0a20b2e02c8ac57c

const app = express();
const PORT = 5001;

<<<<<<< HEAD
// ==========================================
// 1. CONFIGURATION & MIDDLEWARE
// ==========================================

// Middleware
app.use(cors({ origin: '*' })); // Allow all connections
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debugger (Optional: Logs every request)
app.use((req, res, next) => {
    console.log(`📡 Request: ${req.method} ${req.url}`);
    next();
});

// Database Connection
const db_url = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mayukh';
mongoose.connect(db_url)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ DB Error:', err.message));

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// File Upload Helper (Multer + Cloudinary)
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
// 2. DATABASE MODELS
// ==========================================

// Event Model
const Event = mongoose.model('Event', new mongoose.Schema({
    title: String, 
    category: String, 
    eventType: String,
    description: String, 
    posterLink: String, 
    logoLink: String,
    venue: String, 
    date: String, 
    time: String, 
    registrationLink: String,
    rounds: String,        // Added for extra details
    requirements: String,  // Added for extra details
    duration: String,
    teamSize: String,
    prizePool: String,
    registrationFee: String
}, { timestamps: true }));

// Team Model (Categorized)
const Team = mongoose.model('Team', new mongoose.Schema({
    name: String,
    teamName: String,   // e.g., Technical, Cultural, Drama
    memberType: String, // "Core" or "Sub-Core"
    imageUrl: String,
    linkedin: String
}, { timestamps: true }));

// Gallery Model
const Gallery = mongoose.model('Gallery', new mongoose.Schema({
    imageUrl: String,
    caption: String,
    category: String    // e.g., General, Spy-Verse
}, { timestamps: true }));

// ==========================================
// 3. API ROUTES
// ==========================================

// --- EVENTS ROUTES ---
app.get('/api/events', async (req, res) => {
    try {
        const events = await Event.find().sort({ createdAt: -1 });
        res.json({ events }); 
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/events', upload.fields([{name: 'poster'}, {name: 'logo'}]), async (req, res) => {
    try {
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
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/events/:id', async (req, res) => { 
    try {
        await Event.findByIdAndDelete(req.params.id); 
        res.json({ success: true }); 
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- TEAMS ROUTES ---
app.get('/api/teams', async (req, res) => {
    try {
        const teams = await Team.find().sort({ teamName: 1 });
        res.json(teams);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/teams', upload.single('image'), async (req, res) => {
    try {
        // If editing and no new image, keep the old one (passed from frontend)
        let imgUrl = req.body.existingImage || ''; 
        
        if (req.file) {
            const uploaded = await uploadToCloudinary(req.file.buffer, 'mayukh-teams');
            imgUrl = uploaded.secure_url;
        }
        
        const newMember = await new Team({
            name: req.body.name,
            teamName: req.body.teamName,
            memberType: req.body.memberType,
            imageUrl: imgUrl,
            linkedin: req.body.linkedin
        }).save();
        res.json(newMember);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/teams/:id', async (req, res) => { 
    try {
        await Team.findByIdAndDelete(req.params.id); 
        res.json({ success: true }); 
    } catch (e) { res.status(500).json({ error: e.message }); }
});
=======
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve frontend from client folder
app.use(express.static(path.join(__dirname, '../client')));

// Serve admin pages
app.use('/admin', express.static(__dirname));

// MongoDB Connection
const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mayukh';

  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI not set; using local MongoDB');
  } else {
    console.log('Connecting to MongoDB Atlas...');
  }

  try {
    await mongoose.connect(mongoUri, {
      family: 4,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err.message);
});

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

// Health check
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState];
  res.json({ status: 'Server is running', database: dbStatus });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

const PORT = process.env.PORT || 5000;
>>>>>>> cacb304b89ff9a7114f80afc0a20b2e02c8ac57c

// --- GALLERY ROUTES ---
app.get('/api/gallery', async (req, res) => {
    try {
        const photos = await Gallery.find().sort({ createdAt: -1 });
        res.json(photos);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/gallery', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ msg: "Image required" });
        const img = await uploadToCloudinary(req.file.buffer, 'mayukh-gallery');
        
        const newPhoto = await new Gallery({
            imageUrl: img.secure_url,
            caption: req.body.caption,
            category: req.body.category
        }).save();
        res.json(newPhoto);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/gallery/:id', async (req, res) => { 
    try {
        await Gallery.findByIdAndDelete(req.params.id); 
        res.json({ success: true }); 
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ==========================================
// 4. START SERVER
// ==========================================
app.listen(PORT, () => {
<<<<<<< HEAD
    console.log(`\n🚀 SERVER STARTED ON PORT: ${PORT}`);
    // console.log(`👉 Events API: http://localhost:${PORT}/api/events`);
    // console.log(`👉 Teams API:  http://localhost:${PORT}/api/teams`);
    // console.log(`👉 Gallery API: http://localhost:${PORT}/api/gallery\n`);
});
=======
  console.log(`Server running on http://localhost:${PORT}`);
});
>>>>>>> cacb304b89ff9a7114f80afc0a20b2e02c8ac57c
