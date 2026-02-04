export default class PauseMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseMenu' });
    }

    create(data) {
    this.gameScene = data.gameScene || 'SectorScene';
    this.scene.pause(this.gameScene);
    
    // 🔴 AGREGAR ESTA LÍNEA:
    this.scene.bringToTop();
    
    const width = 1280;
    const height = 720;

        // Fondo semi-transparente oscuro
        const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85);
        bg.setScrollFactor(0);
        bg.setDepth(1000);

        // Título "PAUSA"
        const title = this.add.text(width / 2, height / 3, 'PAUSA', {
            fontSize: '72px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8
        });
        title.setOrigin(0.5);
        title.setScrollFactor(0);
        title.setDepth(1001);

        // Botón Reanudar
        const resumeButton = this.createButton(
            width / 2, 
            height / 2, 
            'REANUDAR', 
            '#4CAF50',
            '#45a049',
            () => this.resumeGame()
        );

        // Botón Salir al Menú
        const exitButton = this.createButton(
            width / 2, 
            height / 2 + 100, 
            'SALIR AL MENÚ', 
            '#f44336',
            '#da190b',
            () => this.exitToMenu()
        );

        // Instrucción
        const instruction = this.add.text(width / 2, height - 60, 'Presiona ESC para reanudar', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#aaaaaa'
        });
        instruction.setOrigin(0.5);
        instruction.setScrollFactor(0);
        instruction.setDepth(1001);

        // Permitir reanudar con ESC
        this.escKey = this.input.keyboard.addKey('ESC');
    }

    update() {
        // Reanudar con ESC
        if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
            this.resumeGame();
        }
    }

    createButton(x, y, text, normalColor, hoverColor, callback) {
        const button = this.add.text(x, y, text, {
            fontSize: '36px',
            fontFamily: 'Arial',
            color: '#ffffff',
            backgroundColor: normalColor,
            padding: { x: 30, y: 15 }
        });
        button.setOrigin(0.5);
        button.setScrollFactor(0); // ← IMPORTANTE: Esto fija el botón
        button.setDepth(1001);
        button.setInteractive({ useHandCursor: true });

        // Efectos hover
        button.on('pointerover', () => {
            button.setStyle({ backgroundColor: hoverColor });
            button.setScale(1.05);
        });

        button.on('pointerout', () => {
            button.setStyle({ backgroundColor: normalColor });
            button.setScale(1);
        });

        button.on('pointerdown', () => {
            button.setScale(0.95);
        });

        button.on('pointerup', () => {
            button.setScale(1.05);
            callback();
        });

        return button;
    }

   resumeGame() {
    console.log("Reanudando escena:", this.gameScene); 
    
    // USA RESUME EN LUGAR DE START
    this.scene.resume(this.gameScene);
    this.scene.stop('PauseMenu');
    }

    exitToMenu() {
    console.log("Saliendo al menú...");
    this.scene.stop(this.gameScene);
    this.scene.stop('PauseMenu');
    this.scene.start('MenuScene');
    }
}