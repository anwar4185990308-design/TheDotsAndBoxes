const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('./'));

// CONFIG: Replace with your actual MongoDB URI
const uri = "mongodb+srv://anamuyt66tt_db_user:wbEIKDFt6Fl8YSAO@cluster0.my8z8ya.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri);

async function initDB() {
    try {
        await client.connect();
        console.log(">> TITAN_OS: DATABASE_LINK_ESTABLISHED");
    } catch (e) { console.error("LINK_FAILURE", e); }
}
initDB();

// --- AUTH: SIGNUP ---
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    const db = client.db("Titan-OS");
    const users = db.collection("users");

    const exists = await users.findOne({ username });
    if (exists) return res.json({ success: false, message: "ID_ALREADY_RESERVED" });

    const newUser = {
        username,
        password, // Stored as plain text per request
        files: {
            levels: 1,
            coin: 0,
            wins: 0,
            streak: 0,
            xp: 0
        }
    };

    await users.insertOne(newUser);
    res.json({ success: true, data: newUser });
});

// --- AUTH: LOGIN ---
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const db = client.db("Titan-OS");
    const user = await db.collection("users").findOne({ username, password });

    if (user) res.json({ success: true, data: user });
    else res.json({ success: false, message: "INVALID_CREDENTIALS" });
});

// --- DATA: GET PROFILE ---
app.get('/get-profile/:username', async (req, res) => {
    const db = client.db("Titan-OS");
    const user = await db.collection("users").findOne({ username: req.params.username });
    if (user) res.json({ success: true, data: user.files });
    else res.json({ success: false });
});

// --- DATA: SAVE (The "Virtual File" Writer) ---
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
                    "files.streak": data.streak,
                    "files.xp": data.xp
                } 
            }
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`TITAN_OS_ONLINE_ON_${PORT}`));

