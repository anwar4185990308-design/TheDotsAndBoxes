/**
 * LEADERBOARD.JS - Neural Global Ranking Interface
 * Optimized for TITAN_OS MongoDB Schema
 */
const GlobalLeaderboard = {
    // Uses the origin URL (e.g., your-app.onrender.com)
    api: `${window.location.origin}/leaderboard`,

    async fetchAndRender() {
        const lbContainer = document.getElementById('lb-content');
        if (!lbContainer) return;

        try {
            // Append timestamp to bust cache
            const response = await fetch(`${this.api}?t=${Date.now()}`);
            
            if (!response.ok) throw new Error("NETWORK_SENSE_FAILURE");
            
            const players = await response.json();
            const currentUser = sessionStorage.getItem('titan_user');

            if (!players || players.length === 0) {
                lbContainer.innerHTML = `
                    <div style="padding:20px; color:#444; font-family:'Fira Code'; font-size:0.8rem; text-align:center;">
                        [ AWAITING_PILOT_DATA... ]
                    </div>`;
                return;
            }

            // Render player entries
            lbContainer.innerHTML = players.map((player, index) => {
                const isSelf = player.username === currentUser;
                
                // Tiered ranking colors
                const rankColor = index === 0 ? '#ffcc00' : // Gold (1st)
                                 (index === 1 ? '#00f2ff' : // Diamond (2nd)
                                 (index === 2 ? '#ff0055' : // Ruby (3rd)
                                 '#555'));                  // Standard
                
                // Safety check for nested 'files' data structure
                const stats = player.files || {};
                const displayLvl = stats.levels || player.level || 1;
                const displayWins = stats.wins || player.wins || 0;
                
                return `
                    <div class="lb-entry" style="
                        border-bottom: 1px solid #111; 
                        padding: 12px 8px; 
                        display:flex; 
                        justify-content:space-between; 
                        align-items:center;
                        transition: 0.3s;
                        background: ${isSelf ? 'rgba(0, 242, 255, 0.08)' : 'transparent'};
                        ${isSelf ? 'border-left: 2px solid var(--blue);' : ''}
                    ">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <span style="color:${rankColor}; font-weight:900; font-family:'Orbitron'; font-size:0.9rem; min-width:30px;">
                                #${index + 1}
                            </span>
                            <span style="font-family:'Rajdhani'; font-weight:700; color:${isSelf ? '#fff' : '#aaa'}; letter-spacing:1px;">
                                ${player.username.toUpperCase()}
                                ${isSelf ? '<span style="font-size:0.6rem; color:var(--blue); display:block; font-family:\'Fira Code\'">[YOU]</span>' : ''}
                            </span>
                        </div>
                        <div style="font-family:'Fira Code'; font-size:0.75rem; text-align:right;">
                            <div style="color:#00ff66;">LVL: ${displayLvl}</div>
                            <div style="color:#00f2ff; font-size:0.65rem;">WINS: ${displayWins}</div>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (e) {
            console.error(">> LEADERBOARD_SYNC_ERROR:", e);
            lbContainer.innerHTML = `
                <div style="color:var(--red); padding:20px; font-family:'Fira Code'; font-size:0.8rem; text-align:center; border: 1px dashed var(--red);">
                    SYNC_OFFLINE: DATABASE_RECONNECTING
                </div>`;
        }
    }
};

// Initial Fetch on load
GlobalLeaderboard.fetchAndRender();

// Refresh rankings every 60 seconds to reduce server load while keeping it fresh
setInterval(() => GlobalLeaderboard.fetchAndRender(), 60000);
