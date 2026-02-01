import { sceneManager } from '../core/SceneManager.js';

export class EndingScene extends Phaser.Scene {
    constructor() {
        super('EndingScene');
    }
    
    init(data) {
        this.ending = data.ending;
    }
    
    create() {
        this.add.text(80, 80, `ENDING: ${this.ending}`, { fontSize: '48px', color: '#ffffff' });
        this.add.text(80, 150, 'ENTER → MENU', { fontSize: '24px', color: '#ffffff' });
        
        this.input.keyboard.once('keydown-ENTER', () => {
            sceneManager.go(this, 'MenuScene');
        });
    }
}

