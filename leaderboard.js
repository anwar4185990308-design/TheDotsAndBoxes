/**
 * LEADERBOARD.JS - Neural Global Ranking Interface
 * Updated for MongoDB Cloud Sync
 */
const GlobalLeaderboard = {
    // Dynamically uses the current site URL (Render) as the API base
    api: `${window.location.origin}/leaderboard`,

    async fetchAndRender() {
        const lbContainer = document.getElementById('lb-content');
        if (!lbContainer) return;

        try {
            // Added a timestamp to prevent browser caching of old rankings
            const response = await fetch(`${this.api}?t=${Date.now()}`);
            
            if (!response.ok) throw new Error("NETWORK_SENSE_FAILURE");
            
            const players = await response.json();
            const currentUser = sessionStorage.getItem('titan_user');

            if (!players || players.length === 0) {
                lbContainer.innerHTML = `<div style="padding:15px; color:#444; font-family:'Fira Code'; font-size:0.8rem;">[ AWAITING_PILOT_DATA... ]</div>`;
                return;
            }

            lbContainer.innerHTML = players.map((player, index) => {
                const isSelf = player.username === currentUser;
                
                // Tiered ranking colors
                const rankColor = index === 0 ? '#ffcc00' : // Gold
                                 (index === 1 ? '#00f2ff' : // Diamond
                                 (index === 2 ? '#ff0055' : // Ruby
                                 '#555'));                  // Standard
                
                return `
                    <div class="lb-entry" style="
                        border-bottom: 1px solid #111; 
                        padding: 10px 5px; 
                        display:flex; 
                        justify-content:space-between; 
                        align-items:center;
                        background: ${isSelf ? 'rgba(0, 242, 255, 0.05)' : 'transparent'};
                    ">
                        <span style="color:${rankColor}; font-weight:bold; font-family:'Orbitron'; font-size:0.8rem;">
                            #${index + 1} ${player.username.toUpperCase()}
                            ${isSelf ? '<span style="font-size:0.5rem; color:#00f2ff; margin-left:5px;">(YOU)</span>' : ''}
                        </span>
                        <div style="font-family:'Fira Code'; font-size:0.7rem;">
                            <span style="color:#00ff66; margin-right:8px;">LVL:${player.level || 1}</span>
                            <span style="color:#00f2ff;">WINS:${player.wins || 0}</span>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (e) {
            console.error(">> LEADERBOARD_SYNC_ERROR:", e);
            lbContainer.innerHTML = `<div style="color:#ff0055; padding:15px; font-family:'Fira Code'; font-size:0.8rem;">SYNC_OFFLINE: DATABASE_RECONNECTING</div>`;
        }
    }
};

// Initial Fetch when script loads
GlobalLeaderboard.fetchAndRender();

// Refresh rankings every 30 seconds to show new pilots
setInterval(() => GlobalLeaderboard.fetchAndRender(), 30000);
