const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const ACCOUNTS_BASE = path.join(__dirname, 'accounts');

// Ensure user directory exists
const ensureDir = (user) => {
    const dir = path.join(ACCOUNTS_BASE, user);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
};

// GET current coins from coin.txt
app.get('/get-coins/:username', (req, res) => {
    const userDir = ensureDir(req.params.username);
    const filePath = path.join(userDir, 'coin.txt');
    
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, "0", 'utf8');
        return res.json({ coins: 0 });
    }
    const val = fs.readFileSync(filePath, 'utf8').trim();
    res.json({ coins: parseInt(val) || 0 });
});

// POST update coin.txt (Sets the value)
app.post('/update-coins', (req, res) => {
    const { username, coins } = req.body;
    const filePath = path.join(ensureDir(username), 'coin.txt');
    
    fs.writeFileSync(filePath, coins.toString(), 'utf8');
    console.log(`[SYSTEM] ${username} balance updated to: ${coins}₮`);
    res.json({ success: true });
});

// POST update collection.json
app.post('/update-collection', (req, res) => {
    const { username, items } = req.body;
    const filePath = path.join(ensureDir(username), 'collection.json');
    
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8');
    console.log(`[SYSTEM] ${username} inventory updated.`);
    res.json({ success: true });
});

app.listen(3000, () => {
    console.log('TITAN_OS BLACK MARKET SERVER RUNNING ON PORT 3000');
});