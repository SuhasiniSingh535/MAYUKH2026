# Cloudinary Setup Guide for Mayukh 2026

## Why Cloudinary over AWS S3?

**Cloudinary is recommended because:**
- ✅ **Easier to set up** - No complex AWS IAM configurations
- ✅ **Free tier** - 25GB storage, 25GB bandwidth/month (perfect for development)
- ✅ **Built-in image transformations** - Resize, crop, optimize automatically
- ✅ **Simple API** - Upload and get URL in one step
- ✅ **CDN included** - Fast image delivery worldwide
- ✅ **No credit card required** for free tier

**AWS S3 is better if:**
- You need more storage (100GB+)
- You want more control over infrastructure
- You're already using AWS services
- You need enterprise-level features

For this project, **Cloudinary is the better choice**.

---

## Step 1: Create Cloudinary Account

1. Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up with your email (or use Google/GitHub)
3. Verify your email address
4. You'll be redirected to your dashboard

---

## Step 2: Get Your Credentials

1. In your Cloudinary dashboard, you'll see:
   - **Cloud Name** (e.g., `dxyz123abc`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

2. **Important:** Click "Reveal" to see your API Secret (it's hidden by default)

---

## Step 3: Add Credentials to .env File

Open `server/.env` and add these three lines:

```env
MONGODB_URI=mongodb+srv://bs:bs123@mayukhdb.bvghhzk.mongodb.net/?appName=MayukhDB
PORT=5001
JWT_SECRET=bs

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dcxmkpffm
CLOUDINARY_API_KEY=332791138998462
CLOUDINARY_API_SECRET=Ly00bXLDZiYi94HX4LxrW2-8Bs8
```

**Replace:**
- `your_cloud_name_here` with your Cloud Name
- `your_api_key_here` with your API Key
- `your_api_secret_here` with your API Secret

**Example:**
```env
CLOUDINARY_CLOUD_NAME=dcxmkpffm
CLOUDINARY_API_KEY=332791138998462
CLOUDINARY_API_SECRET=Ly00bXLDZiYi94HX4LxrW2-8Bs8
```

---

## Step 4: Install Dependencies

Navigate to the `server` folder and run:

```bash
cd server
npm install
```

This will install:
- `cloudinary` - Cloudinary SDK
- `multer` - File upload middleware
- `multer-storage-cloudinary` - Cloudinary storage adapter for multer

---

## Step 5: Test the Setup

1. Start your server:
   ```bash
   npm run dev
   ```

2. Test the upload endpoint using Postman or curl:

   **Using curl:**
   ```bash
   curl -X POST https://mayukh-bv-1.onrender.com/api/events/upload-poster \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -F "poster=@/path/to/your/image.jpg"
   ```

   **Using Postman:**
   - Method: POST
   - URL: `https://mayukh-bv-1.onrender.com/api/events/upload-poster`
   - Headers: 
     - `Authorization: Bearer YOUR_JWT_TOKEN`
   - Body: form-data
     - Key: `poster` (type: File)
     - Value: Select an image file

3. You should get a response like:
   ```json
   {
     "message": "Poster uploaded successfully",
     "posterLink": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/mayukh-events/abc123.jpg",
     "publicId": "mayukh-events/abc123"
   }
   ```

---

## How It Works

### 1. Upload Poster (POST /api/events/upload-poster)
- Uploads image to Cloudinary
- Returns the poster URL
- Stores images in `mayukh-events` folder
- Automatically optimizes and resizes images

### 2. Create Event (POST /api/events)
- Use the `posterLink` from step 1
- Include it in the event data when creating an event

**Example Request:**
```json
{
  "posterLink": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/mayukh-events/abc123.jpg",
  "title": "AI ARENA",
  "description": "Build intelligent algorithms to compete in strategic games.",
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

---

## API Endpoints

### Upload Poster
- **POST** `/api/events/upload-poster`
- **Auth:** Required (Core/Subcore only)
- **Body:** Form-data with `poster` file
- **Response:** `{ posterLink, publicId }`

### Create Event
- **POST** `/api/events`
- **Auth:** Required (Core/Subcore only)
- **Body:** JSON with event details (including `posterLink`)

### Get All Events
- **GET** `/api/events`
- **Query Params:** `?category=SpyVerse&type=Event&status=upcoming`
- **Response:** `{ count, events: [...] }`

### Get Event by ID
- **GET** `/api/events/:id`
- **Response:** Event object

### Update Event
- **PUT** `/api/events/:id`
- **Auth:** Required (Core/Subcore only)
- **Body:** JSON with fields to update

### Delete Event
- **DELETE** `/api/events/:id`
- **Auth:** Required (Core/Subcore only)

---

## Frontend Integration Example

```javascript
// 1. Upload poster first
const formData = new FormData();
formData.append('poster', fileInput.files[0]);

const uploadResponse = await fetch('/api/events/upload-poster', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const { posterLink } = await uploadResponse.json();

// 2. Create event with poster link
const eventData = {
  posterLink,
  title: 'AI ARENA',
  description: 'Build intelligent algorithms...',
  // ... other fields
};

const createResponse = await fetch('/api/events', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(eventData)
});
```

---

## Troubleshooting

### Error: "Cloudinary config is missing"
- Check your `.env` file has all three Cloudinary variables
- Restart your server after updating `.env`

### Error: "Invalid API credentials"
- Double-check your Cloud Name, API Key, and API Secret
- Make sure there are no extra spaces in `.env` file

### Error: "File too large"
- Default limit is 5MB
- Increase in `config/cloudinary.js` if needed

### Images not uploading
- Check file format (jpg, png, gif, webp allowed)
- Verify JWT token is valid
- Check user role is Core or Subcore

---

## Cloudinary Dashboard

You can view all uploaded images in your Cloudinary dashboard:
- Go to [https://console.cloudinary.com/](https://console.cloudinary.com/)
- Click "Media Library"
- See all images in the `mayukh-events` folder

---

## Security Notes

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Keep API Secret private** - Don't share it publicly
3. **Use environment variables** - Never hardcode credentials
4. **Restrict uploads** - Only Core/Subcore can upload (already implemented)

---

## Next Steps

1. ✅ Set up Cloudinary account
2. ✅ Add credentials to `.env`
3. ✅ Install dependencies
4. ✅ Test upload endpoint
5. ✅ Create your first event!

For questions or issues, check the [Cloudinary Documentation](https://cloudinary.com/documentation).
