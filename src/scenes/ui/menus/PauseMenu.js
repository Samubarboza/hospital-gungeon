import { sceneManager } from '../../../core/SceneManager.js';

export class PauseMenu extends Phaser.Scene {
    constructor() {
        super('PauseMenu');
        this.targetSceneKey = 'SectorScene';
        this.sector = null;
    }

    init(data = {}) {
        this.targetSceneKey = data.targetScene || 'SectorScene';
        this.sector = data.sector ?? null;
    }

    create() {
        const { width, height } = this.scale;
        this.add.rectangle(0, 0, width, height, 0x000000, 0.65).setOrigin(0, 0);

        this.add.text(width / 2, height * 0.25, 'PAUSA', {
            fontFamily: 'Arial',
            fontSize: '36px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const centerX = width / 2;
        const startY = height * 0.45;
        const gap = 60;

        this.createMenuButton(centerX, startY, 'Continuar', () => this.resumeGame());
        this.createMenuButton(centerX, startY + gap, 'Reiniciar sector', () => this.restartSector());
        this.createMenuButton(centerX, startY + gap * 2, 'Salir', () => this.exitToMenu());

        this.input.keyboard.on('keydown-ESC', () => this.resumeGame());
        this.input.keyboard.on('keydown-P', () => this.resumeGame());
    }

    createMenuButton(x, y, text, callback) {
        const container = this.add.container(x, y);
        const buttonWidth = 240;
        const buttonHeight = 52;
        const graphics = this.add.graphics();

        this.drawButtonStyle(graphics, buttonWidth, buttonHeight, 0x6c63ff);

        const label = this.add.text(0, 0, text, {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        container.add([graphics, label]);

        const hitArea = new Phaser.Geom.Rectangle(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight);
        container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

        container.on('pointerover', () => {
            this.input.setDefaultCursor('pointer');
            this.drawButtonStyle(graphics, buttonWidth, buttonHeight, 0x8b83ff);
            this.tweens.add({ targets: container, scale: 1.04, duration: 100 });
        });

        container.on('pointerout', () => {
            this.input.setDefaultCursor('default');
            this.drawButtonStyle(graphics, buttonWidth, buttonHeight, 0x6c63ff);
            this.tweens.add({ targets: container, scale: 1, duration: 100 });
        });

        container.on('pointerdown', () => {
            this.tweens.add({ targets: container, scale: 0.96, duration: 50 });
        });

        container.on('pointerup', () => {
            callback();
        });
    }

    drawButtonStyle(graphics, w, h, color) {
        graphics.clear();
        graphics.fillStyle(color, 1);
        graphics.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    }

    resumeGame() {
        const targetScene = this.scene.get(this.targetSceneKey);
        this.scene.stop();
        if (this.scene.isPaused(this.targetSceneKey)) {
            this.scene.resume(this.targetSceneKey);
            if (targetScene && typeof targetScene.onResumeFromPause === 'function') {
                targetScene.onResumeFromPause();
            }
        }
    }

    restartSector() {
        const targetScene = this.targetSceneKey;
        this.scene.stop();
        if (this.scene.isActive('HudScene')) {
            this.scene.stop('HudScene');
        }
        if (targetScene) {
            this.scene.stop(targetScene);
            this.scene.start(targetScene, { sector: this.sector });
        }
    }

    exitToMenu() {
        const targetScene = this.targetSceneKey;
        this.scene.stop();
        if (this.scene.isActive('HudScene')) {
            this.scene.stop('HudScene');
        }
        if (targetScene) {
            this.scene.stop(targetScene);
        }
        sceneManager.go(this, 'MenuScene');
    }
}
