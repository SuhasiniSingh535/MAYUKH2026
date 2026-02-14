const express = require('express');
const cors = require('cors'); // Agar ye install hai
const app = express();

app.use(cors({ origin: '*' })); // Sabko allow karo

app.get('/api/events', (req, res) => {
    console.log("🔥 REQUEST HIT HUYI HAI!");
    res.json({ message: "SUCCESS! Server is working.", events: [] });
});

app.listen(5001, () => console.log("✅ TEST SERVER RUNNING ON 5001"));