import { getDifficultyLabel } from '../../../core/DifficultyConfig.js';

export class HudScene extends Phaser.Scene {
    constructor() {
        super('HudScene');
        this.player = null;
    }

    init(data = {}) {
        this.player = data.player || null;
    }

    create() {
        const panelWidth = 260;
        const panelHeight = 94;
        const padding = 16;

        this.panel = this.add.rectangle(padding, padding, panelWidth, panelHeight, 0x0b0b1d, 0.75)
            .setOrigin(0, 0)
            .setScrollFactor(0);

        this.healthBarBg = this.add.rectangle(padding + 12, padding + 20, 180, 12, 0x1f1f2e, 1)
            .setOrigin(0, 0.5)
            .setScrollFactor(0);
        this.healthBar = this.add.rectangle(padding + 12, padding + 20, 180, 12, 0xff4444, 1)
            .setOrigin(0, 0.5)
            .setScrollFactor(0);

        this.healthText = this.add.text(padding + panelWidth - 12, padding + 10, '100 / 100', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ffffff'
        }).setOrigin(1, 0).setScrollFactor(0);

        this.ammoText = this.add.text(padding + 12, padding + 40, 'Ammo: 0 / 0', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#c7c7ff'
        }).setOrigin(0, 0).setScrollFactor(0);

        this.difficultyText = this.add.text(padding + 12, padding + 60, `Difficulty: ${getDifficultyLabel(this)}`, {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: '#9fd1ff'
        }).setOrigin(0, 0).setScrollFactor(0);

        this.refresh();
    }

    update() {
        this.refresh();
    }

    refresh() {
        if (!this.player || !this.player.stats) return;
        const stats = this.player.stats;
        const maxHealth = Math.max(stats.maxHealth || 1, 1);
        const health = Math.max(stats.health, 0);
        const healthRatio = Phaser.Math.Clamp(health / maxHealth, 0, 1);

        this.healthBar.width = 180 * healthRatio;
        this.healthText.setText(`${health} / ${maxHealth}`);

        const ammo = stats.currentAmmo ?? 0;
        const maxAmmo = stats.maxAmmo ?? 0;
        this.ammoText.setText(`Ammo: ${ammo} / ${maxAmmo}`);
        if (this.difficultyText) {
            this.difficultyText.setText(`Difficulty: ${getDifficultyLabel(this)}`);
        }
    }
}
