import { eventBus } from '../core/EventBus.js';
import { sceneManager } from '../core/SceneManager.js';

export class BossScene extends Phaser.Scene {
    constructor() {
        super('BossScene');
    }
    
    init(data) {
        this.boss = data?.boss ?? 'mirror';
    }
    
    create() {
        this.add.text(80, 80, `BOSS: ${this.boss}`, { fontSize: '48px', color: '#ffffff' });
        this.add.text(80, 150, 'ENTER → BOSS DERROTADO', { fontSize: '24px', color: '#ffffff' });
        
        this.onEndingShow = ({ ending }) => sceneManager.go(this, 'EndingScene', { ending });
        eventBus.on('ending:show', this.onEndingShow);
        
        this.input.keyboard.once('keydown-ENTER', () => {
            eventBus.emit('boss:defeated');
        });
        
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            eventBus.off('ending:show', this.onEndingShow);
        });
    }
}
