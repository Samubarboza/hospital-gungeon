import { ensureDifficulty } from '../../core/DifficultyConfig.js';

const ENEMY_VARIANTS = [
    { id: 'alien1', prefix: 'Wraith_01' },
    { id: 'alien2', prefix: 'Wraith_02' },
    { id: 'alien3', prefix: 'Wraith_03' }
];

const ENEMY_ACTIONS = {
    walk: {
        folder: 'Walking',
        label: 'Moving Forward',
        frames: 12,
        frameRate: 12,
        repeat: -1
    },
    idle: {
        folder: 'Idle',
        label: 'Idle',
        frames: 12,
        frameRate: 8,
        repeat: -1
    },
    idleBlink: {
        folder: 'Idle Blink',
        label: 'Idle Blinking',
        frames: 12,
        frameRate: 8,
        repeat: 0
    },
    attack: {
        folder: 'Attacking',
        label: 'Attack',
        frames: 12,
        frameRate: 12,
        repeat: 0
    },
    cast: {
        folder: 'Casting Spells',
        label: 'Casting Spells',
        frames: 18,
        frameRate: 12,
        repeat: 0
    },
    taunt: {
        folder: 'Taunt',
        label: 'Taunt',
        frames: 18,
        frameRate: 10,
        repeat: 0
    },
    hurt: {
        folder: 'Hurt',
        label: 'Hurt',
        frames: 12,
        frameRate: 14,
        repeat: 0
    },
    dying: {
        folder: 'Dying',
        label: 'Dying',
        frames: 15,
        frameRate: 12,
        repeat: 0
    }
};

const BOSS = { id: 'boss1', prefix: '0_Reaper_Man' };

const BOSS_ACTIONS = {
    idle: { folder: 'Idle', label: 'Idle', frames: 18, frameRate: 8, repeat: -1 },
    idleBlink: { folder: 'Idle Blinking', label: 'Idle Blinking', frames: 18, frameRate: 8, repeat: 0 },
    walk: { folder: 'Walking', label: 'Walking', frames: 24, frameRate: 10, repeat: -1 },
    run: { folder: 'Running', label: 'Running', frames: 12, frameRate: 12, repeat: -1 },
    jumpStart: { folder: 'Jump Start', label: 'Jump Start', frames: 6, frameRate: 12, repeat: 0 },
    jumpLoop: { folder: 'Jump Loop', label: 'Jump Loop', frames: 6, frameRate: 12, repeat: -1 },
    fall: { folder: 'Falling Down', label: 'Falling Down', frames: 6, frameRate: 12, repeat: 0 },
    slide: { folder: 'Sliding', label: 'Sliding', frames: 6, frameRate: 12, repeat: 0 },
    kick: { folder: 'Kicking', label: 'Kicking', frames: 12, frameRate: 12, repeat: 0 },
    slash: { folder: 'Slashing', label: 'Slashing', frames: 12, frameRate: 12, repeat: 0 },
    runSlash: { folder: 'Run Slashing', label: 'Run Slashing', frames: 12, frameRate: 12, repeat: 0 },
    throw: { folder: 'Throwing', label: 'Throwing', frames: 12, frameRate: 12, repeat: 0 },
    runThrow: { folder: 'Run Throwing', label: 'Run Throwing', frames: 12, frameRate: 12, repeat: 0 },
    throwAir: { folder: 'Throwing in The Air', label: 'Throwing in The Air', frames: 12, frameRate: 12, repeat: 0 },
    slashAir: { folder: 'Slashing in The Air', label: 'Slashing in The Air', frames: 12, frameRate: 12, repeat: 0 },
    hurt: { folder: 'Hurt', label: 'Hurt', frames: 12, frameRate: 12, repeat: 0 },
    dying: { folder: 'Dying', label: 'Dying', frames: 15, frameRate: 12, repeat: 0 }
};

const pad3 = (value) => String(value).padStart(3, '0');

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
        this.nextSceneKey = 'Start';
        this.showLoader = true;
        this.hasStarted = false;
        this.loadErrors = [];
        this.loadTimeoutId = null;
        this.onLoadProgress = null;
        this.onLoadComplete = null;
        this.onLoadError = null;
    }

    init(data = {}) {
        this.nextSceneKey = data.nextScene || 'Start';
        this.showLoader = data.showLoader !== undefined ? data.showLoader : true;
        this.hasStarted = false;
        this.loadErrors = [];
        this.loadTimeoutId = null;
        this.onLoadProgress = null;
        this.onLoadComplete = null;
        this.onLoadError = null;
        ensureDifficulty(this);
    }

    preload() {
        if (this.registry.get('gameAssetsLoaded')) return;

        if (this.showLoader) {
            this.createLoadingUI();
        }

        this.load.spritesheet('rect-tiles', 'public/assets/maps/rect_tiles.png', {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.json('narrative-intro', 'public/assets/narrative/intro.json');
        // Player sprites are loaded per-action from player1 below.
        ENEMY_VARIANTS.forEach((variant) => {
            Object.entries(ENEMY_ACTIONS).forEach(([actionKey, action]) => {
                for (let i = 0; i < action.frames; i += 1) {
                    const frameId = pad3(i);
                    const key = `${variant.id}-${actionKey}-${frameId}`;
                    const path = `public/assets/sprites/enemies/${variant.id}/${action.folder}/${variant.prefix}_${action.label}_${frameId}.png`;
                    this.load.image(key, path);
                }
            });
        });

        Object.entries(BOSS_ACTIONS).forEach(([actionKey, action]) => {
            for (let i = 0; i < action.frames; i += 1) {
                const frameId = pad3(i);
                const key = `${BOSS.id}-${actionKey}-${frameId}`;
                const path = `public/assets/sprites/bosses/${BOSS.id}/${action.folder}/${BOSS.prefix}_${action.label}_${frameId}.png`;
                this.load.image(key, path);
            }
        });

        const playerId = 'player1';
        const playerPrefix = '0_Bloody_Alchemist';
        Object.entries(BOSS_ACTIONS).forEach(([actionKey, action]) => {
            for (let i = 0; i < action.frames; i += 1) {
                const frameId = pad3(i);
                const key = `${playerId}-${actionKey}-${frameId}`;
                const path = `public/assets/sprites/player/${playerId}/${action.folder}/${playerPrefix}_${action.label}_${frameId}.png`;
                this.load.image(key, path);
            }
        });

        if (this.showLoader) {
            this.onLoadProgress = (value) => {
                this.updateLoadingUI(value);
            };
            this.onLoadComplete = () => {
                this.load.off('progress', this.onLoadProgress);
                this.loadComplete = true;
                this.updateLoadingUI(1);
            };
            this.onLoadError = (file) => {
                const key = file?.key || file?.src || 'archivo';
                this.loadErrors.push(key);
                this.updateErrorUI();
            };
            this.load.on('progress', this.onLoadProgress);
            this.load.once('complete', this.onLoadComplete);
            this.load.on('loaderror', this.onLoadError);
            this.startLoadTimeout();
        }
    }

    create() {
        this.registry.set('gameAssetsLoaded', true);

        if (!this.textures.exists('bullet')) {
            const gfx = this.add.graphics();
            gfx.fillStyle(0xffffff, 1);
            gfx.fillCircle(3, 3, 3);
            gfx.generateTexture('bullet', 6, 6);
            gfx.destroy();
        }

        ENEMY_VARIANTS.forEach((variant) => {
            Object.entries(ENEMY_ACTIONS).forEach(([actionKey, action]) => {
                const animKey = `${variant.id}-${actionKey}`;
                if (this.anims.exists(animKey)) return;
                const frames = Array.from({ length: action.frames }, (_, index) => ({
                    key: `${variant.id}-${actionKey}-${pad3(index)}`
                }));
                this.anims.create({
                    key: animKey,
                    frames,
                    frameRate: action.frameRate,
                    repeat: action.repeat
                });
            });
        });

        Object.entries(BOSS_ACTIONS).forEach(([actionKey, action]) => {
            const animKey = `${BOSS.id}-${actionKey}`;
            if (this.anims.exists(animKey)) return;
            const frames = Array.from({ length: action.frames }, (_, index) => ({
                key: `${BOSS.id}-${actionKey}-${pad3(index)}`
            }));
            this.anims.create({
                key: animKey,
                frames,
                frameRate: action.frameRate,
                repeat: action.repeat
            });
        });

        Object.entries(BOSS_ACTIONS).forEach(([actionKey, action]) => {
            const animKey = `player-${actionKey}`;
            if (this.anims.exists(animKey)) return;
            const frames = Array.from({ length: action.frames }, (_, index) => ({
                key: `player1-${actionKey}-${pad3(index)}`
            }));
            this.anims.create({
                key: animKey,
                frames,
                frameRate: action.frameRate,
                repeat: action.repeat
            });
        });

        const playerTexture = this.textures.get('player1-idle-000');
        if (playerTexture) {
            playerTexture.setFilter(Phaser.Textures.FilterMode.NEAREST);
        }

        // Compatibilidad con PlayerController usando nuevos anims
        this.createAliasAnimation('walk-right', 'player-walk', 12, -1);
        this.createAliasAnimation('walk-left', 'player-walk', 12, -1);
        this.createAliasAnimation('walk-up', 'player-walk', 12, -1);
        this.createAliasAnimation('walk-down', 'player-walk', 12, -1);
        this.createAliasAnimation('idle', 'player-idle', 8, -1);

        this.registry.set('enemyVariants', ENEMY_VARIANTS.map((variant) => variant.id));
        this.registry.set('enemyDefaultTexture', `${ENEMY_VARIANTS[0].id}-walk-000`);
        this.registry.set('bossId', BOSS.id);
        this.registry.set('playerTextureKey', 'player1-idle-000');
        this.registry.set('playerScale', 0.18);

        this.cameras.main.roundPixels = true;
        this.finishLoading();
    }

    createAliasAnimation(aliasKey, sourceKey, frameRate, repeat) {
        if (this.anims.exists(aliasKey)) return;
        const source = this.anims.get(sourceKey);
        if (!source || !source.frames || source.frames.length === 0) return;

        const frames = source.frames
            .map((frame) => {
                const textureKey = frame.textureKey;
                const textureFrame = frame.textureFrame?.name;
                if (!textureKey) return null;
                return textureFrame !== undefined
                    ? { key: textureKey, frame: textureFrame }
                    : { key: textureKey };
            })
            .filter(Boolean);

        if (frames.length === 0) return;
        this.anims.create({
            key: aliasKey,
            frames,
            frameRate,
            repeat
        });
    }

    createLoadingUI() {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#040218');

        const barWidth = Math.min(width * 0.6, 420);
        const barHeight = 18;
        const barX = (width - barWidth) / 2;
        const barY = height / 2;

        this.loadingText = this.add.text(width / 2, barY - 40, 'Cargando...', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.percentText = this.add.text(width / 2, barY + 30, '0%', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.barBg = this.add.graphics();
        this.barBg.fillStyle(0x1b1b2e, 1);
        this.barBg.fillRoundedRect(barX, barY, barWidth, barHeight, 8);

        this.barFill = this.add.graphics();
        this.barFill.fillStyle(0x6c63ff, 1);
        this.barFill.fillRoundedRect(barX + 2, barY + 2, 0, barHeight - 4, 6);

        this.errorText = this.add.text(width / 2, barY + 60, '', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ff6666'
        }).setOrigin(0.5);

        this.loadingBar = {
            x: barX,
            y: barY,
            width: barWidth,
            height: barHeight
        };
    }

    updateLoadingUI(value) {
        if (!this.barFill || !this.loadingBar) return;

        const width = Math.max((this.loadingBar.width - 4) * value, 0);
        this.barFill.clear();
        this.barFill.fillStyle(0x6c63ff, 1);
        this.barFill.fillRoundedRect(
            this.loadingBar.x + 2,
            this.loadingBar.y + 2,
            width,
            this.loadingBar.height - 4,
            6
        );

        if (this.percentText) {
            this.percentText.setText(`${Math.round(value * 100)}%`);
        }
    }

    updateErrorUI() {
        if (!this.errorText) return;
        if (this.loadErrors.length === 0) {
            this.errorText.setText('');
            return;
        }
        this.errorText.setText(`Archivos faltantes: ${this.loadErrors.length}`);
    }

    startLoadTimeout() {
        if (this.loadTimeoutId) return;
        this.loadTimeoutId = setTimeout(() => {
            if (this.hasStarted) return;
            this.finishLoading(true);
        }, 12000);
    }

    finishLoading(forced = false) {
        if (this.hasStarted) return;
        this.hasStarted = true;

        if (this.loadTimeoutId) {
            clearTimeout(this.loadTimeoutId);
            this.loadTimeoutId = null;
        }

        if (this.onLoadProgress) this.load.off('progress', this.onLoadProgress);
        if (this.onLoadComplete) this.load.off('complete', this.onLoadComplete);
        if (this.onLoadError) this.load.off('loaderror', this.onLoadError);
        this.onLoadProgress = null;
        this.onLoadComplete = null;
        this.onLoadError = null;

        this.destroyLoadingUI();

        if (forced && !this.registry.get('gameAssetsLoaded')) {
            this.registry.set('gameAssetsLoaded', false);
        }

        this.scene.start(this.nextSceneKey);
    }

    destroyLoadingUI() {
        if (this.loadingText) this.loadingText.destroy();
        if (this.percentText) this.percentText.destroy();
        if (this.errorText) this.errorText.destroy();
        if (this.barBg) this.barBg.destroy();
        if (this.barFill) this.barFill.destroy();
        this.loadingText = null;
        this.percentText = null;
        this.errorText = null;
        this.barBg = null;
        this.barFill = null;
        this.loadingBar = null;
    }
}
