/**
 * TITAN_OS // ACCOUNT_SYSTEM_CORE
 * Primary bridge for Authentication and Data Persistence.
 */

const AccountSystem = {
    // The base URL for your local Node.js server
    BASE_URL: 'http://localhost:3000',

    /**
     * AUTHENTICATION: LOGIN
     * Verification of Pilot Credentials
     */
    async login(username, password) {
        console.log(`>> INITIATING_LINK: ${username}...`);
        try {
            const response = await fetch(`${this.BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();
            
            if (result.success) {
                console.log(">> LINK_ESTABLISHED: Access Granted.");
                return { success: true, data: result.data };
            } else {
                console.warn(">> LINK_FAILURE: " + result.message);
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error(">> CRITICAL_COMM_ERROR:", error);
            return { success: false, message: "SERVER_OFFLINE" };
        }
    },

    /**
     * AUTHENTICATION: SIGNUP
     * Initialization of New Neural Identity
     */
    async signup(username, password) {
        console.log(`>> RESERVING_ID: ${username}...`);
        try {
            const response = await fetch(`${this.BASE_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (result.success) {
                console.log(">> IDENTITY_RESERVED: Pilot Enrolled.");
                return { success: true, data: result.data };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error) {
            console.error(">> ENROLLMENT_ERROR:", error);
            return { success: false, message: "SERVER_OFFLINE" };
        }
    },

    /**
     * DATA PERSISTENCE: SAVE PROGRESS
     * Backs up Levels, XP, Wins, and Streaks
     */
    async saveProgress(username, data) {
        console.log(`>> SYNCING_PROGRESS: ${username}...`);
        try {
            const response = await fetch(`${this.BASE_URL}/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, data })
            });

            const result = await response.json();
            if (result.success) {
                // Update local storage to keep client in sync with server
                sessionStorage.setItem('titan_data', JSON.stringify(data));
                return true;
            }
            return false;
        } catch (error) {
            console.error(">> SYNC_ERROR:", error);
            return false;
        }
    },

    /**
     * BANKING SYSTEM: SAVE COINS
     * Specifically updates the coin.txt via the server
     */
    async saveCoins(username, coins) {
        console.log(`>> UPLOADING_CREDITS: ${coins}₮ to ${username}...`);
        try {
            const response = await fetch(`${this.BASE_URL}/save-coins`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, coins })
            });

            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error(">> BANK_TRANSFER_ERROR:", error);
            return false;
        }
    },

    /**
     * SYSTEM TERMINATION
     * Clears local cache and disconnects
     */
    logout() {
        console.log(">> TERMINATING_SESSION...");
        sessionStorage.removeItem('titan_user');
        sessionStorage.removeItem('titan_data');
        window.location.href = 'index.html'; 
    },

    /**
     * UTILITY: GET LOCAL DATA
     * Quickly retrieves current pilot session info
     */
    getLocalData() {
        const user = sessionStorage.getItem('titan_user');
        const rawData = sessionStorage.getItem('titan_data');
        if (!user || !rawData) return null;
        
        return {
            username: user,
            stats: JSON.parse(rawData)
        };
    }
};