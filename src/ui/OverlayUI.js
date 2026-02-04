export class OverlayUI {
    constructor(scene) {
        this.scene = scene;
        this.container = null;
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;
        this.injectStyles();
        this.injectHTML();
        this.cacheElements();
        this.isInitialized = true;
    }

    injectStyles() {
        const styleId = 'game-overlay-styles';
        if (document.getElementById(styleId)) return;

        const css = `
        /* Overlay UI Styles - Health Bar Only */
        #game-ui-root {
            font-family: 'Courier New', monospace;
            color: #eee;
            pointer-events: none;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10;
        }

        #game-ui-root > * {
            pointer-events: auto;
        }

        /* Health Bar Float - Top Left */
        #hp-container {
            position: fixed;
            top: 20px;
            left: 20px;
            width: 300px;
            background: rgba(0, 0, 0, 0.5);
            padding: 10px;
            border-radius: 8px;
            border: 2px solid #555;
        }

        .hp-bar-bg {
            width: 100%;
            height: 20px;
            background: #333;
            border-radius: 10px;
            overflow: hidden;
            border: 2px solid #555;
        }

        .hp-bar-fill {
            height: 100%;
            background: linear-gradient(90deg, #ff4444, #ff8844);
            transition: width 0.3s;
        }

        /* Victory Screen */
        #victory {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #00ff88 0%, #00ccff 100%);
            color: #000;
            padding: 50px;
            border-radius: 25px;
            text-align: center;
            display: none;
            border: 6px solid #00ff88;
            box-shadow: 0 0 60px rgba(0, 255, 136, 0.9);
            z-index: 1000;
        }

        #victory h1 {
            font-size: 56px;
            margin-bottom: 25px;
            animation: pulse 1s infinite;
        }

        #victory button {
            padding: 18px 40px;
            font-size: 20px;
            background: #000;
            color: #00ff88;
            border: 4px solid #00ff88;
            border-radius: 12px;
            cursor: pointer;
            font-family: 'Courier New', monospace;
            margin-top: 25px;
            transition: all 0.3s;
            font-weight: bold;
        }

        #victory button:hover {
            background: #00ff88;
            color: #000;
            transform: scale(1.1);
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }

        /* Pop-up Messages */
        .room-label {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95);
            color: #00ff88;
            padding: 30px 50px;
            border-radius: 15px;
            border: 4px solid #00ff88;
            font-size: 32px;
            font-weight: bold;
            display: none;
            z-index: 999;
            animation: fadeInOut 2s;
        }

        @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
            50% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
        }

        #victory {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #00ff88 0%, #00ccff 100%);
            color: #000;
            padding: 50px;
            border-radius: 25px;
            text-align: center;
            display: none;
            border: 6px solid #00ff88;
            box-shadow: 0 0 60px rgba(0, 255, 136, 0.9);
            z-index: 1000;
        }

        #victory h1 {
            font-size: 56px;
            margin-bottom: 25px;
            animation: pulse 1s infinite;
        }

        #victory button {
            padding: 18px 40px;
            font-size: 20px;
            background: #000;
            color: #00ff88;
            border: 4px solid #00ff88;
            border-radius: 12px;
            cursor: pointer;
            font-family: 'Courier New', monospace;
            margin-top: 25px;
            transition: all 0.3s;
            font-weight: bold;
        }

        #victory button:hover {
            background: #00ff88;
            color: #000;
            transform: scale(1.1);
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }

        .room-label {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95);
            color: #00ff88;
            padding: 30px 50px;
            border-radius: 15px;
            border: 4px solid #00ff88;
            font-size: 32px;
            font-weight: bold;
            display: none;
            z-index: 999;
            animation: fadeInOut 2s;
        }

        @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
            50% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
        }


        `;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = css;
        document.head.appendChild(style);
    }

    injectHTML() {
        if (document.getElementById('game-ui-root')) return;

        const container = document.createElement('div');
        container.id = 'game-ui-root';
        container.innerHTML = `
            <!-- Simplified HUD - Only Health Bar -->
            <div id="hp-container">
                <div class="hp-bar-bg">
                    <div class="hp-bar-fill" id="playerHPBar" style="width: 100%"></div>
                </div>
            </div>

            <div id="victory">
                <h1>🎉 ¡VICTORIA! 🎉</h1>
                <p style="font-size: 24px;">¡Has derrotado al BOSS!</p>
                <p style="font-size: 18px;">Juego Completado</p>
                <button id="restartButton">🔄 Jugar de Nuevo</button>
            </div>

            <div id="roomLabel" class="room-label"></div>
        `;

        document.body.appendChild(container);

        // Bind Restart Button
        const btn = document.getElementById('restartButton');
        if (btn) {
            btn.onclick = () => {
                window.location.reload();
            };
        }
    }

    cacheElements() {
        this.elPlayerHPBar = document.getElementById('playerHPBar');
        this.elVictory = document.getElementById('victory');
        this.elRoomLabel = document.getElementById('roomLabel');
    }

    // ===========================
    // UPDATE METHODS
    // ===========================

    updateDoorStatus(doors) {
        // Disabled
    }

    updateStats(roomName, currentRoomIndex, totalRooms, enemyCount, playerHp, maxHp) {
        if (!this.elPlayerHPBar) return;
        const hpPct = Math.max(0, Math.min(100, (playerHp / maxHp) * 100));
        this.elPlayerHPBar.style.width = `${hpPct}%`;
    }

    updateClearedRooms(clearedSet) {
        // Disabled
    }

    showRoomLabel(text) {
        if (!this.elRoomLabel) return;
        this.elRoomLabel.textContent = text;
        this.elRoomLabel.style.display = 'block';
        // Reset animation
        this.elRoomLabel.style.animation = 'none';
        this.elRoomLabel.offsetHeight; /* trigger reflow */
        this.elRoomLabel.style.animation = 'fadeInOut 2s';

        setTimeout(() => {
            this.elRoomLabel.style.display = 'none';
        }, 2000);
    }

    showVictory() {
        if (this.elVictory) {
            this.elVictory.style.display = 'block';
        }
    }
}
