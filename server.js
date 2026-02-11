const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, './')));

// --- MONGODB CONNECTION ---
// Ensure you have your MongoDB URI in your Render Environment Variables
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://anamuyt66tt_db_user:wbEIKDFt6Fl8YSAO@cluster0.my8z8ya.mongodb.net/?appName=Cluster0";
mongoose.connect(MONGO_URI)
    .then(() => console.log("DATABASE: NEURAL_LINK_ESTABLISHED"))
    .catch(err => console.error("DATABASE: LINK_FAILURE", err));

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
}, { minimize: false }); // Ensures empty objects/fields are saved

const User = mongoose.model('User', userSchema);

// --- ACCOUNT & SAVE SYSTEM ---

// 1. SAVE PROGRESS (The "Old Way" - Direct Object Update)
app.post('/save-progress', async (req, res) => {
    const { username, files } = req.body; // Expecting the 'files' object directly
    try {
        const updatedUser = await User.findOneAndUpdate(
            { username: username },
            { $set: { files: files } },
            { new: true }
        );
        if (updatedUser) {
            res.json({ success: true, message: "DATA_RESTORED_TO_CORE" });
        } else {
            res.status(404).json({ success: false, message: "PILOT_NOT_FOUND" });
        }
    } catch (err) {
        console.error("SAVE_ERROR:", err);
        res.status(500).json({ success: false, message: "CORE_WRITE_FAILURE" });
    }
});

// 2. GET PROFILE
app.get('/get-profile/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (user) {
            res.json({ success: true, data: user.files });
        } else {
            res.status(404).json({ success: false });
        }
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// 3. LEADERBOARD SYSTEM
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

// 4. AUTH SYSTEM
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

// Serve index.html by default
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`TITAN_OS: ONLINE ON PORT ${PORT}`));
