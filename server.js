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
// Make sure to replace <db_password> with the password you created in Database Access!
const MONGO_URI = "mongodb+srv://anamuyt66tt_db_user:wbEIKDFt6Fl8YSAO@cluster0.my8z8ya.mongodb.net/titan_os?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
    .then(() => console.log(">> TITAN_DB: NEURAL_CLOUD_CONNECTED"))
    .catch(err => console.error(">> TITAN_DB: CONNECTION_ERROR", err));

// --- DATA SCHEMA (Pilot Profile) ---
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

// --- GATEWAY STATUS PAGE ---
app.get('/', (req, res) => {
    res.send(`
        <body style="background:#050508; color:#00f2ff; font-family:monospace; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; border: 10px solid #ff0055; margin:0;">
            <h1 style="color:#ff0055; letter-spacing:10px; font-size:3rem; text-shadow: 0 0 20px #ff0055;">TITAN_OS: MASTER_CORE</h1>
            <div style="background:rgba(0,242,255,0.05); padding:30px; border:1px solid #333; box-shadow: 0 0 30px rgba(0,0,0,1);">
                <p style="color:#00f2ff;">> NEURAL_GATEWAY: [ ACTIVE ]</p>
                <p style="color:#00ff66;">> DATABASE_SYNC: [ MONGODB_CLOUD ]</p>
                <p style="color:#ffcc00;">> STATUS: ONLINE</p>
            </div>
        </body>
    `);
});

// --- API ROUTES ---

// 1. SYNC COINS
app.get('/get-coins/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        res.json({ success: true, coins: user ? user.coins : 0 });
    } catch (err) {
        res.json({ success: false, coins: 0 });
    }
});

// 2. UPDATE COINS
app.post(['/save-coins', '/update-coins'], async (req, res) => {
    const { username, coins } = req.body;
    try {
        await User.findOneAndUpdate({ username }, { coins });
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false });
    }
});

// 3. SIGNUP: Reserve Identity
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        const newUser = new User({ username, password });
        await newUser.save();
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false, message: "ID_TAKEN_OR_ERROR" });
    }
});

// 4. LOGIN: Link Start
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (!user) return res.json({ success: false, message: "INVALID_CREDENTIALS" });
        
        // Return data in the format your frontend expects
        res.json({ 
            success: true, 
            data: { 
                level: user.level, 
                xp: user.xp, 
                wins: user.wins, 
                streak: user.streak,
                coins: user.coins 
            } 
        });
    } catch (err) {
        res.json({ success: false, message: "SERVER_ERROR" });
    }
});

// 5. SAVE PROGRESS (Levels/XP/Wins)
app.post('/save', async (req, res) => {
    const { username, data } = req.body;
    try {
        await User.findOneAndUpdate({ username }, data);
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false });
    }
});

// --- SERVER START ---
const PORT = process.env.PORT || 10000; 
app.listen(PORT, '0.0.0.0', () => {
    console.log(`>> TITAN_OS MASTER SERVER ONLINE [PORT ${PORT}]`);
});

