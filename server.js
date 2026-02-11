const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('./')); // Serves your HTML/JS files

// --- MONGO CONFIG ---
const uri = "YOUR_MONGODB_CONNECTION_STRING_HERE"; 
const client = new MongoClient(uri);

async function connectDB() {
    try {
        await client.connect();
        console.log(">> TITAN_OS: NEURAL_LINK_ESTABLISHED (MongoDB Connected)");
    } catch (e) {
        console.error(">> TITAN_OS: LINK_FAILURE", e);
    }
}
connectDB();

// --- 1. SIGNUP (Create User & Virtual Folders) ---
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    const db = client.db("Titan-OS");
    const users = db.collection("users");

    const existing = await users.findOne({ username });
    if (existing) return res.json({ success: false, message: "USER_EXISTS" });

    const newUser = {
        username,
        password, // Saved here
        files: {
            levels: 1,
            coin: 0,
            wins: 0,
            streak: 0
        }
    };

    await users.insertOne(newUser);
    res.json({ success: true, data: newUser });
});

// --- 2. LOGIN ---
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const db = client.db("Titan-OS");
    const user = await db.collection("users").findOne({ username, password });

    if (user) {
        res.json({ success: true, data: user });
    } else {
        res.json({ success: false, message: "INVALID_CREDENTIALS" });
    }
});

// --- 3. SAVE PROGRESS (Writing to virtual .txt files) ---
app.post('/save-progress', async (req, res) => {
    const { username, data } = req.body;
    const db = client.db("Titan-OS");

    try {
        await db.collection("users").updateOne(
            { username: username },
            { 
                $set: { 
                    "files.levels": data.level,
                    "files.coin": data.coins,
                    "files.wins": data.wins,
                    "files.streak": data.streak
                } 
            }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`>> SYSTEM_READY_ON_PORT_${PORT}`));
