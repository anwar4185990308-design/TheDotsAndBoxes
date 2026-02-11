const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors());

// --- MONGODB CONNECTION ---
// Replace the URI with your actual MongoDB Connection String
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://anamuyt66tt_db_user:wbEIKDFt6Fl8YSAO@cluster0.my8z8ya.mongodb.net/?appName=Cluster0";
mongoose.connect(MONGO_URI)
    .then(() => console.log("CORE_DATABASE: LINKED"))
    .catch(err => console.error("CORE_DATABASE: LINK_FAILURE", err));

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
});

const User = mongoose.model('User', userSchema);

// --- ROUTES ---

// 1. LEADERBOARD ENDPOINT (The fix for your error)
app.get('/leaderboard', async (req, res) => {
    try {
        // Sort by level (descending) then by wins (descending)
        const topPilots = await User.find({}, 'username files')
            .sort({ "files.levels": -1, "files.wins": -1 })
            .limit(10);
        
        // Flatten the data for easier frontend consumption
        const formatted = topPilots.map(p => ({
            username: p.username,
            level: p.files.levels,
            wins: p.files.wins
        }));

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ success: false, message: "DATABASE_QUERY_ERROR" });
    }
});

// 2. GET PROFILE
app.get('/get-profile/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (user) {
            res.json({ success: true, data: user.files });
        } else {
            res.status(404).json({ success: false, message: "PILOT_NOT_FOUND" });
        }
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// 3. SAVE PROGRESS
app.post('/save-progress', async (req, res) => {
    const { username, stats } = req.body;
    try {
        await User.findOneAndUpdate(
            { username: username },
            { $set: { 
                "files.levels": stats.level,
                "files.coin": stats.coins,
                "files.wins": stats.wins,
                "files.streak": stats.streak,
                "files.xp": stats.xp
            }}
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// 4. AUTH ROUTES (Login/Signup - Simplified)
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) res.json({ success: true, data: user });
    else res.json({ success: false, message: "INVALID_CREDENTIALS" });
});

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        const newUser = new User({ username, password, files: { levels: 1, coin: 500, wins: 0, streak: 0, xp: 0 } });
        await newUser.save();
        res.json({ success: true, data: newUser });
    } catch (err) {
        res.json({ success: false, message: "ID_ALREADY_EXISTS" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`TITAN_OS_SERVER: ACTIVE ON PORT ${PORT}`));
