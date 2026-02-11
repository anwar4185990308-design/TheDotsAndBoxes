/**
 * LEADERBOARD.JS - Neural Global Ranking Interface
 */
const GlobalLeaderboard = {
    // Dynamically set API URL
    api: `${window.location.origin}/leaderboard`,

    async fetchAndRender() {
        const lbContainer = document.getElementById('lb-content');
        if (!lbContainer) return;

        try {
            // Fetch data from server
            const response = await fetch(`${this.api}?t=${Date.now()}`);
            
            if (!response.ok) throw new Error("OFFLINE");
            
            const players = await response.json();
            const currentUser = sessionStorage.getItem('titan_user');

            if (!players || players.length === 0) {
                lbContainer.innerHTML = `<div style="padding:20px; color:#444; font-family:'Fira Code'; font-size:0.8rem;">[ AWAITING_PILOT_DATA... ]</div>`;
                return;
            }

            lbContainer.innerHTML = players.map((player, index) => {
                const isSelf = player.username === currentUser;
                
                // Tiered ranking colors
                const rankColor = index === 0 ? '#ffcc00' : 
                                 (index === 1 ? '#00f2ff' : 
                                 (index === 2 ? '#ff0055' : '#555'));
                
                return `
                    <div class="lb-entry" style="
                        border-bottom: 1px solid #111; 
                        padding: 12px 10px; 
                        display:flex; 
                        justify-content:space-between; 
                        align-items:center;
                        background: ${isSelf ? 'rgba(0, 242, 255, 0.05)' : 'transparent'};
                    ">
                        <div>
                            <span style="color:${rankColor}; font-weight:bold; font-family:'Orbitron'; font-size:0.9rem;">
                                #${index + 1}
                            </span>
                            <span style="margin-left:10px; font-family:'Rajdhani'; font-weight:700; color:${isSelf ? '#fff' : '#aaa'}">
                                ${player.username.toUpperCase()}
                            </span>
                        </div>
                        <div style="font-family:'Fira Code'; font-size:0.75rem; text-align:right;">
                            <div style="color:#00ff66;">LVL: ${player.level}</div>
                            <div style="color:#00f2ff;">WINS: ${player.wins}</div>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (e) {
            console.error("LB_ERROR:", e);
            lbContainer.innerHTML = `<div style="color:#ff0055; padding:20px; font-family:'Fira Code'; font-size:0.7rem; border:1px solid #300;">SYNC_OFFLINE: DATABASE_RECONNECTING...</div>`;
        }
    }
};

// Initial load
GlobalLeaderboard.fetchAndRender();

// Refresh every 30 seconds
setInterval(() => GlobalLeaderboard.fetchAndRender(), 30000);
