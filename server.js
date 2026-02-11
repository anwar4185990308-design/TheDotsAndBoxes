const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();

// --- CONFIGURATION ---
app.use(cors());
app.use(express.json()); // Built-in alternative to body-parser
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

// --- GATEWAY STATUS PAGE (Health Check) ---
app.get('/', (req, res) => {
    res.send(`
        <body style="background:#050508; color:#00f2ff; font-family:monospace; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; border: 10px solid #ff0055; margin:0;">
            <h1 style="color:#ff0055; letter-spacing:10px; font-size:3rem; text-shadow: 0 0 20px #ff0055;">TITAN_OS: MASTER_CORE</h1>
            <div style="background:rgba(0,242,255,0.05); padding:30px; border:1px solid #333; box-shadow: 0 0 30px rgba(0,0,0,1);">
                <p style="color:#00f2ff;">> NEURAL_GATEWAY: [ ACTIVE ]</p>
                <p style="color:#00ff66;">> DATABASE_SYNC: [ STABLE ]</p>
                <p style="color:#ffcc00;">> STATUS: ONLINE</p>
            </div>
        </body>
    `);
});

// --- API ROUTES ---
app.get('/get-coins/:username', (req, res) => {
    const { username } = req.params;
    const coinFile = path.join(getPilotDir(username), 'coin.txt');
    if (!fs.existsSync(coinFile)) fs.writeFileSync(coinFile, "0");
    const balance = fs.readFileSync(coinFile, 'utf8').trim();
    res.json({ success: true, coins: parseInt(balance) || 0 });
});

const handleCoinUpdate = (req, res) => {
    const { username, coins } = req.body;
    const coinFile = path.join(getPilotDir(username), 'coin.txt');
    fs.writeFileSync(coinFile, coins.toString());
    res.json({ success: true });
};
app.post('/save-coins', handleCoinUpdate);
app.post('/update-coins', handleCoinUpdate);

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

// --- SERVER START ---
// Port 10000 is Render's default, 3000 is for local testing
const PORT = process.env.PORT || 10000; 
app.listen(PORT, '0.0.0.0', () => {
    console.log(`>> TITAN_OS MASTER SERVER ONLINE [PORT ${PORT}]`);
});
