const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();

// --- CONFIGURATION & MIDDLEWARE ---
app.use(express.json());
app.use(cors());
// Serves your HTML/JS/CSS files from the root directory
app.use(express.static(path.join(__dirname, './')));

// --- DATABASE CONNECTION ---
// IMPORTANT: Set your MONGO_URI in Render Environment Variables
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://anamuyt66tt_db_user:wbEIKDFt6Fl8YSAO@cluster0.my8z8ya.mongodb.net/?appName=Cluster0";
mongoose.connect(MONGO_URI)
    .then(() => console.log(">> SYSTEM: DATABASE_CONNECTED"))
    .catch(err => console.error(">> SYSTEM: DATABASE_CONNECTION_ERROR", err));

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
}, { minimize: false }); // Prevents DB from stripping 0 values

const User = mongoose.model('User', userSchema);

// --- API ENDPOINTS ---

// 1. SAVE PROGRESS (The "Old System" Restored & Fixed)
app.post('/save-progress', async (req, res) => {
    const { username, files } = req.body;
    try {
        const updatedUser = await User.findOneAndUpdate(
            { username: username },
            { $set: { files: files } },
            { new: true, upsert: true }
        );
        res.json({ success: true, message: "DATA_VAULT_UPDATED" });
    } catch (err) {
        console.error("SAVE_ERROR:", err);
        res.status(500).json({ success: false, message: "WRITE_FAILURE" });
    }
});

// 2. LEADERBOARD (Optimized Sorting)
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
        res.status(500).json({ success: false });
    }
});

// 3. AUTH: LOGIN
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (user) {
            res.json({ success: true, data: user.files });
        } else {
            res.json({ success: false, message: "INVALID_CREDENTIALS" });
        }
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// 4. AUTH: SIGNUP
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        const newUser = new User({ 
            username, 
            password, 
            files: { levels: 1, coin: 500, wins: 0, streak: 0, xp: 0 } 
        });
        await newUser.save();
        res.json({ success: true, data: newUser.files });
    } catch (err) {
        res.json({ success: false, message: "ID_ALREADY_EXISTS" });
    }
});

// 5. GET PROFILE (For page refreshes)
app.get('/get-profile/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (user) res.json({ success: true, data: user.files });
        else res.status(404).json({ success: false });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// CATCH-ALL: Serves index.html for any unknown route (Important for Single Page feel)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`TITAN_OS_SERVER: ONLINE ON PORT ${PORT}`));
