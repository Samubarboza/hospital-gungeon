import { eventBus } from '../core/EventBus.js';
import { sceneManager } from '../core/SceneManager.js';

export class HubScene extends Phaser.Scene {
    constructor() {
        super('HubScene');
    }
    
    create() {
        this.add.text(80, 80, 'HUB', { fontSize: '48px', color: '#ffffff' });
        this.add.text(80, 150, 'ENTER → CONTINUAR RUN', { fontSize: '24px', color: '#ffffff' });
        
        this.onSectorEnter = ({ sector }) => sceneManager.go(this, 'SectorScene', { sector });
        this.onBossEnter = ({ boss }) => sceneManager.go(this, 'BossScene', { boss });
        
        eventBus.on('sector:enter', this.onSectorEnter);
        eventBus.on('boss:enter', this.onBossEnter);
        
        this.input.keyboard.once('keydown-ENTER', () => {
            eventBus.emit('hub:continue');
        });
        
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            eventBus.off('sector:enter', this.onSectorEnter);
            eventBus.off('boss:enter', this.onBossEnter);
        });
    }
}
    