const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// --- CONFIGURATION ---
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); 

const ACCOUNTS_DIR = path.join(__dirname, 'accounts');
if (!fs.existsSync(ACCOUNTS_DIR)) {
    console.log(">> SYSTEM_NOTICE: INITIALIZING TITAN_DATABASE...");
    fs.mkdirSync(ACCOUNTS_DIR);
}

// Helper to ensure user directories exist
const getPilotDir = (username) => {
    const userDir = path.join(ACCOUNTS_DIR, username);
    if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });
    return userDir;
};

// --- GATEWAY STATUS PAGE ---
app.get('/', (req, res) => {
    res.send(`
        <body style="background:#050508; color:#00f2ff; font-family:monospace; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; border: 10px solid #ff0055; margin:0;">
            <h1 style="color:#ff0055; letter-spacing:10px; font-size:3rem; text-shadow: 0 0 20px #ff0055;">TITAN_OS: MASTER_CORE</h1>
            <div style="background:rgba(0,242,255,0.05); padding:30px; border:1px solid #333; box-shadow: 0 0 30px rgba(0,0,0,1);">
                <p style="color:#00f2ff;">> NEURAL_GATEWAY: [ ACTIVE ]</p>
                <p style="color:#00ff66;">> DATABASE_SYNC: [ STABLE ]</p>
                <p style="color:#ffcc00;">> PORT_LISTENER: 3000</p>
                <p style="color:#ff0055;">> SHOP_MODULE: [ INTEGRATED ]</p>
            </div>
        </body>
    `);
});

// --- BANKING CORE ---

// Fetch coins
app.get('/get-coins/:username', (req, res) => {
    const { username } = req.params;
    const coinFile = path.join(getPilotDir(username), 'coin.txt');
    if (!fs.existsSync(coinFile)) fs.writeFileSync(coinFile, "0");
    const balance = fs.readFileSync(coinFile, 'utf8').trim();
    res.json({ success: true, coins: parseInt(balance) || 0 });
});

// Unified Update/Save Coins (Supports both /save-coins and /update-coins)
const handleCoinUpdate = (req, res) => {
    const { username, coins } = req.body;
    const coinFile = path.join(getPilotDir(username), 'coin.txt');
    fs.writeFileSync(coinFile, coins.toString());
    console.log(`[BANK] ${username} balance adjusted to: ${coins}₮`);
    res.json({ success: true });
};
app.post('/save-coins', handleCoinUpdate);
app.post('/update-coins', handleCoinUpdate);

// --- SHOP & COLLECTION CORE ---

// Save Inventory (collection.json)
app.post('/update-collection', (req, res) => {
    const { username, items } = req.body;
    const colFile = path.join(getPilotDir(username), 'collection.json');
    fs.writeFileSync(colFile, JSON.stringify(items, null, 2));
    console.log(`[SHOP] ${username} collection updated.`);
    res.json({ success: true });
});

// Save Upgrades (optional server-side persistence)
app.post('/update-upgrades', (req, res) => {
    const { username, upgrades } = req.body;
    const upFile = path.join(getPilotDir(username), 'upgrades.json');
    fs.writeFileSync(upFile, JSON.stringify(upgrades, null, 2));
    res.json({ success: true });
});

// --- AUTH & PROGRESSION ---

app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    const userDir = path.join(ACCOUNTS_DIR, username);
    if (fs.existsSync(userDir)) return res.json({ success: false, message: "ID_TAKEN" });

    getPilotDir(username);
    fs.writeFileSync(path.join(userDir, 'pass.txt'), password);
    fs.writeFileSync(path.join(userDir, 'levels.txt'), JSON.stringify({ level: 1, xp: 0, wins: 0, streak: 0 }));
    fs.writeFileSync(path.join(userDir, 'coin.txt'), "0");
    res.json({ success: true });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const userDir = path.join(ACCOUNTS_DIR, username);
    if (!fs.existsSync(userDir)) return res.json({ success: false, message: "NOT_FOUND" });
    if (fs.readFileSync(path.join(userDir, 'pass.txt'), 'utf8') !== password) return res.json({ success: false, message: "WRONG_PASS" });

    const data = JSON.parse(fs.readFileSync(path.join(userDir, 'levels.txt'), 'utf8'));
    res.json({ success: true, data });
});

app.post('/save', (req, res) => {
    const { username, data } = req.body;
    fs.writeFileSync(path.join(getPilotDir(username), 'levels.txt'), JSON.stringify(data));
    res.json({ success: true });
});

app.get('/leaderboard', (req, res) => {
    const users = fs.readdirSync(ACCOUNTS_DIR);
    const leaderData = users.map(u => {
        const p = path.join(ACCOUNTS_DIR, u, 'levels.txt');
        return fs.existsSync(p) ? { username: u, ...JSON.parse(fs.readFileSync(p)) } : null;
    }).filter(x => x).sort((a, b) => b.level - a.level || b.wins - a.wins);
    res.json(leaderData);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`\n>> TITAN_OS MASTER SERVER ONLINE [PORT ${PORT}]`);
    console.log(`>> ALL SYSTEMS (BANKING, SHOP, AUTH) INTEGRATED\n`);
});