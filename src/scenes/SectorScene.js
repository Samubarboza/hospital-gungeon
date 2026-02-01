import { eventBus } from '../core/EventBus.js';
import { sceneManager } from '../core/SceneManager.js';

export class SectorScene extends Phaser.Scene {
    constructor() {
        super('SectorScene');
    }
    
    init(data) {
        this.sector = data.sector;
    }
    
    create() {
        this.add.text(80, 80, `SECTOR: ${this.sector}`, { fontSize: '48px', color: '#ffffff' });
        this.add.text(80, 150, 'ENTER → SECTOR LIMPIO', { fontSize: '24px', color: '#ffffff' });
        
        this.input.keyboard.once('keydown-ENTER', () => {
            eventBus.emit('sector:complete');
            sceneManager.go(this, 'HubScene');
        });
    }
}
