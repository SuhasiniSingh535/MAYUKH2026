# 📸 Complete Guide: Upload Photos to Cloudinary

## 🎯 Overview

1. **Upload photo** → Get Cloudinary URL
2. **Use that URL** → Create event with poster

---

## 📋 Prerequisites

✅ Server running (`npm run dev`)  
✅ Cloudinary credentials in `.env`  
✅ A Core/Subcore user account (for authentication)

---

## 🚀 Step-by-Step Process

### **Step 1: Create a Core/Subcore User (If you don't have one)**

#### Using Postman:

**POST** `http://localhost:5000/api/auth/signup`

**Body (JSON):**
```json
{
  "name": "Admin User",
  "email": "admin@mayukh.com",
  "password": "admin123",
  "role": "Core"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "Admin User",
    "email": "admin@mayukh.com",
    "role": "Core"
  }
}
```

**Save the `token`** - you'll need it for upload!

---

### **Step 2: Login (If you already have an account)**

**POST** `http://localhost:5000/api/auth/login`

**Body (JSON):**
```json
{
  "email": "admin@mayukh.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

**Save the `token`**!

---

### **Step 3: Upload Photo to Cloudinary**

#### Method 1: Using Postman (Easiest)

1. **Open Postman**
2. **Create new request:**
   - Method: `POST`
   - URL: `http://localhost:5000/api/events/upload-poster`

3. **Headers:**
   - Key: `Authorization`
   - Value: `Bearer YOUR_TOKEN_HERE`
   - (Replace `YOUR_TOKEN_HERE` with token from Step 1/2)

4. **Body:**
   - Select: `form-data`
   - Key: `poster` (make sure type is **File**, not Text)
   - Value: Click "Select Files" and choose an image

5. **Click Send**

**Expected Response:**
```json
{
  "message": "Poster uploaded successfully",
  "posterLink": "https://res.cloudinary.com/dcxmkpffm/image/upload/v1234567890/mayukh-events/abc123.jpg",
  "publicId": "mayukh-events/abc123"
}
```

**✅ Copy the `posterLink`** - This is your Cloudinary URL!

---

#### Method 2: Using cURL (Terminal)

```bash
curl -X POST http://localhost:5000/api/events/upload-poster \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "poster=@/path/to/your/image.jpg"
```

Replace:
- `YOUR_TOKEN_HERE` with your JWT token
- `/path/to/your/image.jpg` with actual image path

---

#### Method 3: Using Frontend JavaScript

```javascript
// 1. Get token (from login)
const token = localStorage.getItem('token'); // or from login response

// 2. Create form data
const formData = new FormData();
const fileInput = document.getElementById('posterInput'); // Your file input
formData.append('poster', fileInput.files[0]);

// 3. Upload to Cloudinary
const response = await fetch('http://localhost:5000/api/events/upload-poster', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const data = await response.json();
console.log('Poster URL:', data.posterLink);
// Use data.posterLink when creating event
```

---

### **Step 4: Create Event with Poster URL**

Now use the `posterLink` from Step 3 to create an event:

**POST** `http://localhost:5000/api/events`

**Headers:**
- `Authorization: Bearer YOUR_TOKEN`
- `Content-Type: application/json`

**Body (JSON):**
```json
{
  "posterLink": "https://res.cloudinary.com/dcxmkpffm/image/upload/v1234567890/mayukh-events/abc123.jpg",
  "title": "AI ARENA",
  "description": "Build intelligent algorithms to compete in strategic games. Train models, optimize performance, and outwit opponents.",
  "date": "2026-02-15",
  "time": "10:00 AM",
  "venue": "Main Hall",
  "day": "Day 1",
  "duration": "5 Hours",
  "teamSize": {
    "min": 2,
    "max": 3
  },
  "category": "Sci-FiVerse",
  "type": "Event",
  "registrationFee": 350,
  "prizePool": "₹30,000",
  "skillsRequired": ["Machine Learning", "Python", "TensorFlow"],
  "format": "Competition",
  "status": "upcoming"
}
```

**Response:**
```json
{
  "message": "Event created successfully",
  "event": {
    "_id": "...",
    "posterLink": "https://res.cloudinary.com/...",
    "title": "AI ARENA",
    ...
  }
}
```

---

## 🎨 Complete Example: HTML Form

Create a simple HTML file to test:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Upload Event Poster</title>
</head>
<body>
  <h1>Upload Event Poster</h1>
  
  <!-- Step 1: Login -->
  <div>
    <h2>1. Login</h2>
    <input type="email" id="email" placeholder="Email" />
    <input type="password" id="password" placeholder="Password" />
    <button onclick="login()">Login</button>
  </div>

  <!-- Step 2: Upload Poster -->
  <div>
    <h2>2. Upload Poster</h2>
    <input type="file" id="posterInput" accept="image/*" />
    <button onclick="uploadPoster()">Upload</button>
    <div id="posterUrl"></div>
  </div>

  <!-- Step 3: Create Event -->
  <div>
    <h2>3. Create Event</h2>
    <input type="text" id="title" placeholder="Event Title" />
    <textarea id="description" placeholder="Description"></textarea>
    <button onclick="createEvent()">Create Event</button>
  </div>

  <script>
    let token = '';
    let posterUrl = '';

    // Login function
    async function login() {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (data.token) {
        token = data.token;
        alert('Login successful!');
      }
    }

    // Upload poster function
    async function uploadPoster() {
      if (!token) {
        alert('Please login first!');
        return;
      }

      const fileInput = document.getElementById('posterInput');
      if (!fileInput.files[0]) {
        alert('Please select an image!');
        return;
      }

      const formData = new FormData();
      formData.append('poster', fileInput.files[0]);

      const response = await fetch('http://localhost:5000/api/events/upload-poster', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      if (data.posterLink) {
        posterUrl = data.posterLink;
        document.getElementById('posterUrl').innerHTML = 
          `<p>Poster URL: <a href="${posterUrl}" target="_blank">${posterUrl}</a></p>`;
        alert('Poster uploaded successfully!');
      }
    }

    // Create event function
    async function createEvent() {
      if (!posterUrl) {
        alert('Please upload poster first!');
        return;
      }

      const eventData = {
        posterLink: posterUrl,
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        date: "2026-02-15",
        time: "10:00 AM",
        day: "Day 1",
        duration: "5 Hours",
        teamSize: { min: 2, max: 3 },
        category: "Sci-FiVerse",
        type: "Event",
        registrationFee: 350,
        status: "upcoming"
      };

      const response = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventData)
      });

      const data = await response.json();
      if (data.event) {
        alert('Event created successfully!');
        console.log('Event:', data.event);
      }
    }
  </script>
</body>
</html>
```

---

## ✅ Quick Test Checklist

- [ ] Server running on port 5000
- [ ] Core/Subcore user created
- [ ] Login successful (got token)
- [ ] Upload poster endpoint working
- [ ] Got Cloudinary URL back
- [ ] Created event with poster URL
- [ ] Event visible in database

---

## 🔍 Verify Upload

### Check Cloudinary Dashboard:
1. Go to [Cloudinary Dashboard](https://console.cloudinary.com/)
2. Click "Media Library"
3. Look in `mayukh-events` folder
4. Your uploaded images will be there!

### Check MongoDB:
```javascript
// In MongoDB Compass or via API
GET http://localhost:5000/api/events
// Should show your created event with posterLink
```

---

## 🐛 Troubleshooting

### Error: "No token, authorization denied"
- Make sure you're logged in
- Check token is in Authorization header
- Format: `Bearer YOUR_TOKEN`

### Error: "Access denied. Core or Subcore role required"
- Your user must have role "Core" or "Subcore"
- Create new user with correct role

### Error: "No file uploaded"
- Make sure file input is selected
- Check file format (jpg, png, gif, webp)
- Max file size: 5MB

### Error: "Cloudinary config is missing"
- Check `.env` file has all Cloudinary credentials
- Restart server after updating `.env`

---

## 📝 Summary

**Flow:**
1. Login → Get token
2. Upload photo → Get Cloudinary URL
3. Create event → Use Cloudinary URL

**That's it!** Your photos are now stored in Cloudinary and URLs are saved in your database.

---

**Need help?** Check the API endpoints in `server/routes/events.js`
