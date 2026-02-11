const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();

// --- PRE-START CONFIG ---
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, './')));

// --- DATABASE CONNECTION (With Error Handling) ---
// REPLACE THIS STRING if not using Environment Variables
const MONGO_URI = process.env.MONGO_URI || "your_mongodb_connection_string_here";

mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000 // Give up after 5 seconds instead of hanging
})
.then(() => console.log(">> [SYSTEM]: DATABASE_LINK_SUCCESS"))
.catch(err => {
    console.error(">> [SYSTEM]: DATABASE_LINK_FAILURE");
    console.error(err.message);
});

// --- USER SCHEMA ---
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    files: {
        levels: { type: Number, default: 1 },
        coin: { type: Number, default: 500 },
        wins: { type: Number, default: 0 },
        streak: { type: Number, default: 0 },
        xp: { type: Number, default: 0 }
    }
}, { minimize: false });

const User = mongoose.model('User', userSchema);

// --- API ROUTES ---

// Health Check (Use this to test if server is even awake)
app.get('/ping', (req, res) => res.send('PONG'));

// Leaderboard
app.get('/leaderboard', async (req, res) => {
    try {
        const topPilots = await User.find({}, 'username files')
            .sort({ "files.levels": -1, "files.wins": -1 })
            .limit(10);
        
        const formatted = topPilots.map(p => ({
            username: p.username,
            level: p.files.levels,
            wins: p.files.wins
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json([]);
    }
});

// Save System
app.post('/save-progress', async (req, res) => {
    const { username, files } = req.body;
    if (!username || !files) return res.status(400).json({ success: false });

    try {
        await User.findOneAndUpdate(
            { username: username },
            { $set: { files: files } },
            { new: true, upsert: true }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// Auth: Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (user) res.json({ success: true, data: user.files });
        else res.json({ success: false, message: "INVALID_CREDENTIALS" });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// Auth: Signup
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        const newUser = new User({ username, password, files: { levels: 1, coin: 500, wins: 0, streak: 0, xp: 0 } });
        await newUser.save();
        res.json({ success: true, data: newUser.files });
    } catch (err) {
        res.json({ success: false, message: "USER_EXISTS" });
    }
});

// Static Fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`>> [SYSTEM]: TITAN_OS_ACTIVE ON PORT ${PORT}`);
});
