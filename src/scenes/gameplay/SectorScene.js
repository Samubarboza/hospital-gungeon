import { ROOM_TEMPLATES } from '../../systems/rooms/RoomTemplates.js';
import { resetSceneTime, setupMap, setupPlayer, setupStaticGroups, setupEnemyAssets } from './sector/sectorSetup.js';
import { setupSectorInput, setSceneInputEnabled } from './sector/sectorInput.js';
import { createEnemySystem } from './sector/sectorEnemies.js';
import { createCombatSystem } from './sector/sectorCombat.js';
import { createRoomSystem } from './sector/sectorRooms.js';
import { setupSectorCollisions } from './sector/sectorCollisions.js';

export class SectorScene extends Phaser.Scene {
    constructor() {
        super('SectorScene');
        this.exitTriggered = false;
        this._cleanup = [];
    }

    init(data = {}) {
        this.sector = data.sector ?? this.sector;
        this.exitTriggered = false;
    }

    create() {
        resetSceneTime(this);

        const inputSystem = setupSectorInput(this);
        this.inputSystem = inputSystem;
        if (inputSystem?.cleanup) this._cleanup.push(() => inputSystem.cleanup());

        setupMap(this);
        setupStaticGroups(this);

        const starterTemplate = ROOM_TEMPLATES.starter;
        setupPlayer(this, starterTemplate);
        setupEnemyAssets(this);

        this.separationRadius = 90;
        this.separationStrength = 180;

        this.enemySystem = createEnemySystem(this);
        this.combatSystem = createCombatSystem(this, this.enemySystem);
        this.roomSystem = createRoomSystem(this, this.enemySystem);

        const collisionSystem = setupSectorCollisions(this, this.combatSystem);
        if (collisionSystem?.destroy) this._cleanup.push(() => collisionSystem.destroy());

        this._onEnemyKilled = (enemy) => this.roomSystem.onEnemyKilled(enemy);
        this.events.on('enemyKilled', this._onEnemyKilled);
        this._cleanup.push(() => this.events.off('enemyKilled', this._onEnemyKilled));

        this.roomSystem.loadRoomByIndex(0, 'left');

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.shutdown());
    }

    update(time, delta) {
        if (this.inputSystem?.handlePauseInput?.()) return;
        this.player.update();
        this.combatSystem.handleMeleeHits();
        this.enemySystem.update(time, delta);
        this.roomSystem.update(delta);
    }

    openPauseMenu() {
        const sceneKey = this.sys.settings.key;
        if (this.scene.isPaused(sceneKey)) return;
        if (this.scene.isActive('PauseMenu')) return;
        setSceneInputEnabled(this, false);
        this.scene.launch('PauseMenu', { targetScene: sceneKey, sector: this.sector });
        this.scene.pause();
    }

    onResumeFromPause() {
        setSceneInputEnabled(this, true);
        if (this.game?.canvas) {
            this.game.canvas.focus();
        }
    }

    shutdown() {
        this._cleanup.forEach((cleanup) => cleanup());
        this._cleanup = [];

        if (this.roomSystem?.destroy) {
            this.roomSystem.destroy();
        }

        if (this.scene.isActive('HudScene')) {
            this.scene.stop('HudScene');
        }
        if (this.scene.isActive('PauseMenu')) {
            this.scene.stop('PauseMenu');
        }
    }
}

