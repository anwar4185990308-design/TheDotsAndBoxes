const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// --- CONFIGURATION ---
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); 

// --- DATABASE CONNECTION ---
const MONGO_URI = "mongodb+srv://anamuyt66tt_db_user:wbEIKDFt6Fl8YSAO@cluster0.my8z8ya.mongodb.net/titan_os?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
    .then(() => console.log(">> TITAN_DB: NEURAL_CLOUD_CONNECTED"))
    .catch(err => console.error(">> TITAN_DB: CONNECTION_ERROR", err));

// --- DATA SCHEMA (This replaces your profile.txt) ---
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    coins: { type: Number, default: 0 }
});

const User = mongoose.model('User', userSchema);

// --- API ROUTES ---

// 1. GET PILOT DATA (Replaces reading profile.txt)
app.get('/get-profile/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.json({ success: false, message: "PILOT_NOT_FOUND" });
        res.json({ success: true, data: user });
    } catch (err) {
        res.json({ success: false });
    }
});

// 2. SAVE PROFILE DATA (Replaces writing to profile.txt)
app.post('/save-progress', async (req, res) => {
    const { username, data } = req.body;
    try {
        // This finds the user and "merges" the new level/xp/wins data
        await User.findOneAndUpdate({ username }, data);
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false });
    }
});

// 3. GET COINS ONLY (For the Hub)
app.get('/get-coins/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        res.json({ success: true, coins: user ? user.coins : 0 });
    } catch (err) {
        res.json({ success: false, coins: 0 });
    }
});

// 4. AUTH ROUTES (Login/Signup)
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        const newUser = new User({ username, password });
        await newUser.save();
        res.json({ success: true, data: newUser });
    } catch (err) {
        res.json({ success: false, message: "ID_TAKEN" });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (!user) return res.json({ success: false, message: "INVALID_CREDENTIALS" });
        res.json({ success: true, data: user });
    } catch (err) {
        res.json({ success: false });
    }
});

// LEADERBOARD ROUTE
app.get('/leaderboard', async (req, res) => {
    const top = await User.find().sort({ wins: -1 }).limit(10);
    res.json(top);
});

const PORT = process.env.PORT || 10000; 
app.listen(PORT, '0.0.0.0', () => {
    console.log(`>> TITAN_OS MASTER SERVER ONLINE [PORT ${PORT}]`);
});
