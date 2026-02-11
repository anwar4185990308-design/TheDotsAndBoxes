const AccountSystem = {
    // Determine if we are running locally or on Render
    API_BASE: window.location.origin,

    // LOGIN SYSTEM
    login: async (username, password) => {
        try {
            const response = await fetch(`${AccountSystem.API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const result = await response.json();
            if (result.success) {
                // Store nested files in session for the Hub
                sessionStorage.setItem('titan_user', result.data.username);
                sessionStorage.setItem('titan_data', JSON.stringify({
                    level: result.data.files.levels,
                    coins: result.data.files.coin,
                    wins: result.data.files.wins,
                    streak: result.data.files.streak
                }));
            }
            return result;
        } catch (e) {
            return { success: false, message: "SERVER_OFFLINE" };
        }
    },

    // SIGNUP SYSTEM
    signup: async (username, password) => {
        const response = await fetch(`${AccountSystem.API_BASE}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        return await response.json();
    },

    // SAVE SYSTEM (Updates the virtual .txt files)
    saveProgress: async (username, stats) => {
        try {
            const response = await fetch(`${AccountSystem.API_BASE}/save-progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: username,
                    data: {
                        level: stats.level,
                        coins: stats.coins,
                        wins: stats.wins,
                        streak: stats.streak
                    }
                })
            });
            
            const result = await response.json();
            if (result.success) {
                // Keep the local session in sync with the cloud
                sessionStorage.setItem('titan_data', JSON.stringify(stats));
                console.log(">> TITAN_OS: CLOUD_SYNC_COMPLETE");
            }
            return result;
        } catch (e) {
            console.error(">> TITAN_OS: SYNC_ERROR", e);
            return { success: false };
        }
    }
};
