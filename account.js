/**
 * ACCOUNT.JS - Neural Link & Data Persistence System
 */

const AccountSystem = {
    apiBase: window.location.origin,

    async login(username, password) {
        try {
            const response = await fetch(`${this.apiBase}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const result = await response.json();
            if (result.success) {
                this.syncSession(username, result.data);
                return { success: true };
            }
            return result;
        } catch (e) {
            return { success: false, message: "SERVER_OFFLINE: Wait 30s for Render to wake up." };
        }
    },

    async signup(username, password) {
        try {
            const response = await fetch(`${this.apiBase}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const result = await response.json();
            if (result.success) {
                this.syncSession(username, result.data);
                return { success: true };
            }
            return result;
        } catch (e) {
            return { success: false, message: "SERVER_OFFLINE: Wait 30s for Render to wake up." };
        }
    },

    async saveProgress(username, filesObject) {
        if (!username || !filesObject) return false;
        try {
            const response = await fetch(`${this.apiBase}/save-progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, files: filesObject })
            });
            const result = await response.json();
            if (result.success) {
                // Update local storage to keep session in sync
                this.syncSession(username, filesObject);
                return true;
            }
            return false;
        } catch (e) {
            console.error("DATA_SYNC_LOST");
            return false;
        }
    },

    syncSession(username, files) {
        sessionStorage.setItem('titan_user', username);
        // Map DB 'files' keys to game 'data' keys
        const localData = {
            level: files.levels,
            coins: files.coin,
            wins: files.wins,
            streak: files.streak,
            xp: files.xp || 0
        };
        sessionStorage.setItem('titan_data', JSON.stringify(localData));
    },

    logout() {
        sessionStorage.clear();
        window.location.href = 'index.html';
    }
};
