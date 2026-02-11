/**
 * ACCOUNT.JS - Neural Link & Data Persistence System
 * Synchronized for TITAN_OS MongoDB Schema
 */

const AccountSystem = {
    // Dynamically points to your Render URL or Localhost
    apiBase: window.location.origin,

    /**
     * AUTHENTICATION: LOGIN
     */
    async login(username, password) {
        try {
            const response = await fetch(`${this.apiBase}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (result.success) {
                // 'result.data' is the 'files' object from the server
                this.syncSession(username, result.data);
                return { success: true, data: result.data };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error("NEURAL_LINK_FAILURE:", error);
            return { success: false, message: "SERVER_OFFLINE" };
        }
    },

    /**
     * AUTHENTICATION: SIGNUP
     */
    async signup(username, password) {
        try {
            const response = await fetch(`${this.apiBase}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (result.success) {
                // Initialize session with default stats returned by server
                this.syncSession(username, result.data);
                return { success: true, data: result.data };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error("IDENTITY_RESERVATION_FAILURE:", error);
            return { success: false, message: "SERVER_OFFLINE" };
        }
    },

    /**
     * DATA PERSISTENCE: SAVE PROGRESS
     * Call this whenever stats change (win/loss/buy)
     */
    async saveProgress(username, filesObject) {
        if (!username) return false;

        try {
            const response = await fetch(`${this.apiBase}/save-progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: username,
                    files: filesObject // Matches the 'files' key in server.js
                })
            });

            const result = await response.json();
            
            if (result.success) {
                // Update local storage so other pages see changes immediately
                this.syncSession(username, filesObject);
                console.log(">> DATA_SYNC_COMPLETE");
                return true;
            }
            return false;
        } catch (error) {
            console.error("SAVE_WRITE_ERROR:", error);
            return false;
        }
    },

    /**
     * INTERNAL: SYNC SESSION STORAGE
     */
    syncSession(username, files) {
        sessionStorage.setItem('titan_user', username);
        // We map the DB keys to the format the UI/Game expects
        const localFormat = {
            level: files.levels,
            coins: files.coin,
            wins: files.wins,
            streak: files.streak,
            xp: files.xp || 0
        };
        sessionStorage.setItem('titan_data', JSON.stringify(localFormat));
    },

    /**
     * SESSION TERMINATION
     */
    logout() {
        sessionStorage.removeItem('titan_user');
        sessionStorage.removeItem('titan_data');
        window.location.href = 'index.html';
    }
};
