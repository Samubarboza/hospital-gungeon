export class TestScene extends Phaser.Scene {
    constructor() {
        super('TestScene');
    }
    
    create() {
        this.add.text(100, 150, 'TEST SCENE OK', {
            fontSize: '28px',
            color: '#00ff00'
        });
    }
}
