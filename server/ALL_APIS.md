# 🌐 All API Endpoints - Direct Browser Testing

## ✅ Browser Mein Direct Test Kar Sakte Ho (GET Requests)

### 1. **Health Check**
```
GET http://localhost:5000/api/health
```
**Browser mein:** `http://localhost:5000/api/health`  
**Response:**
```json
{"status": "Server is running"}
```

---

### 2. **Get All Events**
```
GET http://localhost:5000/api/events
```
**Browser mein:** `http://localhost:5000/api/events`  
**Response:**
```json
{
  "count": 0,
  "events": []
}
```

**With Filters:**
- `http://localhost:5000/api/events?category=Sci-FiVerse`
- `http://localhost:5000/api/events?type=Event`
- `http://localhost:5000/api/events?status=upcoming`
- `http://localhost:5000/api/events?category=Sci-FiVerse&type=Event`

---

### 3. **Get Single Event by ID**
```
GET http://localhost:5000/api/events/:id
```
**Browser mein:** `http://localhost:5000/api/events/EVENT_ID_HERE`  
**Example:** `http://localhost:5000/api/events/67890abcdef1234567890123`  
**Response:**
```json
{
  "_id": "...",
  "posterLink": "https://...",
  "title": "AI ARENA",
  ...
}
```

---

## ❌ Browser Mein Nahi (POST/PUT/DELETE - Postman/Thunder Client Chahiye)

### 4. **User Signup**
```
POST http://localhost:5000/api/auth/signup
```
**Body (JSON):**
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "test123",
  "role": "Core"
}
```

---

### 5. **User Login**
```
POST http://localhost:5000/api/auth/login
```
**Body (JSON):**
```json
{
  "email": "test@example.com",
  "password": "test123"
}
```

---

### 6. **Get User Profile** (Token Required)
```
GET http://localhost:5000/api/auth/profile
```
**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### 7. **Upload Poster** (Token Required + File Upload)
```
POST http://localhost:5000/api/events/upload-poster
```
**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```
**Body:** form-data with `poster` file

---

### 8. **Create Event** (Token Required)
```
POST http://localhost:5000/api/events
```
**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```
**Body (JSON):**
```json
{
  "posterLink": "https://res.cloudinary.com/...",
  "title": "AI ARENA",
  "description": "...",
  "date": "2026-02-15",
  "time": "10:00 AM",
  "day": "Day 1",
  "duration": "5 Hours",
  "teamSize": { "min": 2, "max": 3 },
  "category": "Sci-FiVerse",
  "type": "Event",
  "registrationFee": 350,
  "prizePool": "₹30,000",
  "status": "upcoming"
}
```

---

### 9. **Update Event** (Token Required)
```
PUT http://localhost:5000/api/events/:id
```
**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```
**Body (JSON):** Fields to update

---

### 10. **Delete Event** (Token Required)
```
DELETE http://localhost:5000/api/events/:id
```
**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 🚀 Quick Browser Test Links

Copy-paste these in your browser:

1. **Health Check:**
   ```
   http://localhost:5000/api/health
   ```

2. **All Events:**
   ```
   http://localhost:5000/api/events
   ```

3. **Events by Category:**
   ```
   http://localhost:5000/api/events?category=Sci-FiVerse
   ```

4. **Events by Type:**
   ```
   http://localhost:5000/api/events?type=Event
   ```

5. **Upcoming Events:**
   ```
   http://localhost:5000/api/events?status=upcoming
   ```

---

## 📋 Complete API List

| Method | Endpoint | Auth Required | Browser Test? |
|--------|----------|---------------|---------------|
| GET | `/api/health` | ❌ No | ✅ Yes |
| GET | `/api/events` | ❌ No | ✅ Yes |
| GET | `/api/events/:id` | ❌ No | ✅ Yes |
| POST | `/api/auth/signup` | ❌ No | ❌ No (Postman) |
| POST | `/api/auth/login` | ❌ No | ❌ No (Postman) |
| GET | `/api/auth/profile` | ✅ Yes | ❌ No (Postman) |
| POST | `/api/events/upload-poster` | ✅ Yes | ❌ No (Postman) |
| POST | `/api/events` | ✅ Yes | ❌ No (Postman) |
| PUT | `/api/events/:id` | ✅ Yes | ❌ No (Postman) |
| DELETE | `/api/events/:id` | ✅ Yes | ❌ No (Postman) |

---

## 🎯 Summary

**Browser mein test kar sakte ho:**
- ✅ Health check
- ✅ Get all events
- ✅ Get single event
- ✅ Filter events (query parameters)

**Browser mein nahi (Postman/Thunder Client chahiye):**
- ❌ POST requests (signup, login, create event)
- ❌ PUT/DELETE requests
- ❌ File uploads
- ❌ Requests with authentication tokens

---

**Note:** Server `http://localhost:5000` par chal raha hona chahiye!
