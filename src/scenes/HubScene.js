import { eventBus } from '../core/EventBus.js';
import { sceneManager } from '../core/SceneManager.js';

export class HubScene extends Phaser.Scene {
    constructor() {
        super('HubScene');
        this.hasEntered = false;
    }

    create() {
        this.add.text(80, 80, 'HUB', { fontSize: '48px', color: '#ffffff' });
        this.add.text(80, 150, 'ENTER -> CONTINUAR RUN', { fontSize: '24px', color: '#ffffff' });

        this.onSectorEnter = ({ sector }) => sceneManager.go(this, 'SectorScene', { sector });
        this.onBossEnter = ({ boss }) => sceneManager.go(this, 'BossScene', { boss });

        eventBus.on('sector:enter', this.onSectorEnter);
        eventBus.on('boss:enter', this.onBossEnter);

        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.input.once('pointerdown', () => this.tryEnter());

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            eventBus.off('sector:enter', this.onSectorEnter);
            eventBus.off('boss:enter', this.onBossEnter);
        });
    }

    tryEnter() {
        if (this.hasEntered) return;
        this.hasEntered = true;
        eventBus.emit('hub:continue');
    }

    update() {
        if (this.hasEntered) return;
        if (
            Phaser.Input.Keyboard.JustDown(this.enterKey) ||
            Phaser.Input.Keyboard.JustDown(this.spaceKey)
        ) {
            this.tryEnter();
        }
    }
}
