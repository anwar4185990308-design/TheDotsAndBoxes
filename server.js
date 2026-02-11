const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Required for file paths
const app = express();

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors());

// SERVE FRONTEND FILES
// This fixes the "Cannot GET /" error
app.use(express.static(path.join(__dirname, './')));

// --- MONGODB CONNECTION ---
const MONGO_URI = process.env.MONGO_URI || "your_mongodb_connection_string_here";
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

// Main Landing
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

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
        res.status(500).json({ success: false });
    }
});

// Get Profile
app.get('/get-profile/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (user) res.json({ success: true, data: user.files });
        else res.status(404).json({ success: false });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// Save Progress
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

// Auth
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
