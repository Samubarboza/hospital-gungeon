// src/scenes/PreloadScene.js
export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        // Asegúrate de que la ruta coincida exactamente con tu carpeta public/assets
        this.load.spritesheet('player', 'public/assets/Player.png', { 
    frameWidth: 252.8, 
    frameHeight: 212 
});
    }

    create() {
        // Creamos las animaciones una sola vez aquí
        const createAnim = (key, start, end) => {
            this.anims.create({
                key: key,
                frames: this.anims.generateFrameNumbers('player', { start, end }),
                frameRate: 10,
                repeat: -1
            });
        };

        createAnim('walk-down', 0, 9);
        createAnim('walk-up', 10, 19);
        createAnim('walk-right', 20, 29);
        createAnim('walk-left', 30, 39);

        this.anims.create({
            key: 'idle',
            frames: [{ key: 'player', frame: 0 }],
            frameRate: 1
        });

        // Saltamos a la escena de prueba
        this.scene.start('TestScene');//cambiar a testScene para pruebas
    }
}   