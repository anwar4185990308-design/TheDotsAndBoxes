const AccountSystem = {
    API_BASE: window.location.origin,

    login: async (username, password) => {
        const res = await fetch(`${AccountSystem.API_BASE}/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username, password })
        });
        return await res.json();
    },

    signup: async (username, password) => {
        const res = await fetch(`${AccountSystem.API_BASE}/signup`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username, password })
        });
        return await res.json();
    },

    saveProgress: async (username, stats) => {
        const res = await fetch(`${AccountSystem.API_BASE}/save-progress`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                username: username,
                data: {
                    level: stats.level,
                    coins: stats.coins,
                    wins: stats.wins,
                    streak: stats.streak,
                    xp: stats.xp
                }
            })
        });
        return await res.json();
    },

    logout: () => {
        sessionStorage.clear();
        location.reload();
    }
};
