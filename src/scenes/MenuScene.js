import { sceneManager } from '../core/SceneManager.js';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }
    
    create() {
        this.add.text(80, 80, 'MENU', { fontSize: '48px', color: '#ffffff' });
        this.add.text(80, 150, 'ENTER → HUB', { fontSize: '24px', color: '#ffffff' });
        
        this.input.keyboard.once('keydown-ENTER', () => {
            sceneManager.go(this, 'HubScene');
        });
    }
}
