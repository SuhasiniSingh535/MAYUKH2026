# API Keys & Credentials Location

## 📍 Main Location: `server/.env` file

**Path:** `c:\Users\suhas\OneDrive\Documents\mayukh website\Mayukh.bv\server\.env`

---

## 🔑 All API Keys & Credentials

### 1. **MongoDB Database**
```
MONGODB_URI=mongodb+srv://bs:bs123@mayukhdb.bvghhzk.mongodb.net/?appName=MayukhDB
```
- **What it is:** MongoDB Atlas connection string
- **Contains:** Username (`bs`), Password (`bs123`), Database URL
- **Where to get:** MongoDB Atlas Dashboard → Connect → Connection String

---

### 2. **JWT Secret Key**
```
JWT_SECRET=bs
```
- **What it is:** Secret key for signing JWT tokens
- **Used for:** User authentication tokens
- **⚠️ Security Note:** This is very weak! Change to a strong random string in production
- **Where to generate:** Use any random string generator (minimum 32 characters recommended)

---

### 3. **Cloudinary Cloud Name**
```
CLOUDINARY_CLOUD_NAME=dcxmkpffm
```
- **What it is:** Your Cloudinary account identifier
- **Where to get:** [Cloudinary Dashboard](https://console.cloudinary.com/) → Dashboard

---

### 4. **Cloudinary API Key**
```
CLOUDINARY_API_KEY=332791138998462
```
- **What it is:** Cloudinary API key for authentication
- **Where to get:** [Cloudinary Dashboard](https://console.cloudinary.com/) → Dashboard

---

### 5. **Cloudinary API Secret**
```
CLOUDINARY_API_SECRET=Ly00bXLDZiYi94HX4LxrW2-8Bs8
```
- **What it is:** Cloudinary API secret (keep this private!)
- **Where to get:** [Cloudinary Dashboard](https://console.cloudinary.com/) → Dashboard → Click "Reveal"

---

## 📂 File Structure

```
server/
├── .env                    ← 🎯 ALL API KEYS ARE HERE
├── .gitignore             ← Ensures .env is NOT committed to Git
├── config/
│   └── cloudinary.js      ← Uses keys from .env (process.env.CLOUDINARY_*)
├── middleware/
│   └── auth.js            ← Uses JWT_SECRET from .env
└── routes/
    └── auth.js            ← Uses JWT_SECRET from .env
```

---

## 🔍 How to View/Edit API Keys

### Method 1: VS Code / Cursor
1. Open `server/.env` file
2. All keys are visible there

### Method 2: File Explorer
1. Navigate to: `c:\Users\suhas\OneDrive\Documents\mayukh website\Mayukh.bv\server`
2. Open `.env` file with Notepad or any text editor

---

## ⚠️ Important Security Notes

1. **Never commit `.env` file to Git** ✅ (Already in `.gitignore`)
2. **Never share API secrets publicly**
3. **Change weak passwords** (especially `JWT_SECRET=bs`)
4. **Use strong random strings** for production

---

## 🔄 Where Each Key is Used

| Key | Used In | Purpose |
|-----|---------|---------|
| `MONGODB_URI` | `server.js` | Database connection |
| `JWT_SECRET` | `routes/auth.js`, `middleware/auth.js` | Token signing/verification |
| `CLOUDINARY_CLOUD_NAME` | `config/cloudinary.js` | Cloudinary config |
| `CLOUDINARY_API_KEY` | `config/cloudinary.js` | Cloudinary authentication |
| `CLOUDINARY_API_SECRET` | `config/cloudinary.js` | Cloudinary authentication |
| `PORT` | `server.js` | Server port (default: 5000) |

---

## 📝 Quick Reference

**To see all keys:**
```bash
cd server
cat .env          # Linux/Mac
type .env         # Windows CMD
Get-Content .env  # Windows PowerShell
```

**To edit keys:**
- Open `server/.env` in any text editor
- Make changes
- Restart server: `npm run dev`

---

## 🆘 If You Need to Get New Keys

### MongoDB:
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Dashboard → Database Access → Create new user
3. Network Access → Whitelist IP
4. Databases → Connect → Copy connection string

### Cloudinary:
1. Go to [Cloudinary Dashboard](https://console.cloudinary.com/)
2. Dashboard shows: Cloud Name, API Key
3. Click "Reveal" to see API Secret

### JWT Secret:
- Generate a strong random string (32+ characters)
- Example: `openssl rand -base64 32` (Linux/Mac)
- Or use: [Random String Generator](https://www.random.org/strings/)

---

**Last Updated:** Current session
**Location:** `server/.env`
