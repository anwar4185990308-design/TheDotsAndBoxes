/**
 * LEADERBOARD.JS - Neural Global Ranking Interface
 */
const GlobalLeaderboard = {
    api: "http://localhost:3000/leaderboard",

    async fetchAndRender() {
        const lbContainer = document.getElementById('lb-content');
        if (!lbContainer) return;

        try {
            const response = await fetch(this.api);
            const players = await response.json();
            const currentUser = sessionStorage.getItem('titan_user');

            if (!players || players.length === 0) {
                lbContainer.innerHTML = `<div style="padding:10px; color:#444;">AWAITING_PILOT_DATA...</div>`;
                return;
            }

            lbContainer.innerHTML = players.map((player, index) => {
                const isSelf = player.username === currentUser;
                const rankColor = index === 0 ? '#ffcc00' : (index === 1 ? '#00f2ff' : (index === 2 ? '#ff0055' : '#888'));
                
                return `
                    <div class="lb-entry ${isSelf ? 'active' : ''}" style="border-bottom: 1px solid #111; padding: 8px 5px; display:flex; justify-content:space-between; align-items:center;">
                        <span style="color:${rankColor}; font-weight:bold;">#${index + 1} ${player.username.toUpperCase()}</span>
                        <div style="font-size:0.7rem;">
                            <span style="color:#00ff66; margin-right:5px;">L:${player.level}</span>
                            <span style="color:#00f2ff;">W:${player.wins}</span>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (e) {
            lbContainer.innerHTML = `<div style="color:red; padding:10px;">SYNC_OFFLINE</div>`;
        }
    }
};

// Initial Fetch
GlobalLeaderboard.fetchAndRender();
// Refresh every 30 seconds
setInterval(() => GlobalLeaderboard.fetchAndRender(), 30000);