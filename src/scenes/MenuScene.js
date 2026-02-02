import { sceneManager } from '../core/SceneManager.js';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    preload() {
        // AQUÍ SOLO CARGAMOS
        this.load.image('background', 'public/assets/HospitalGungeonMenu.png');
    }

    create() {
        const { width, height } = this.scale;

        // 1. Fondo (Ahora en create)
        this.add.image(0, 0, 'background')
            .setOrigin(0, 0)
            .setDisplaySize(width, height);

        const centerX = width / 2;
        const centerY = height / 2;

        // 2. BOTÓN PARTIDA (Posicionado un poco más arriba del centro)
        this.createMenuButton(centerX, centerY - 40, 'Partida', () => {
            console.log("Iniciando partida...");
            sceneManager.go(this, 'SectorScene');
        });

        // 3. BOTÓN SALIR (Posicionado 60 píxeles debajo del de partida)
        this.createMenuButton(centerX, centerY + 40, 'Salir', () => {
            console.log("Saliendo...");
            window.location.reload(); 
        });
    }

    // FUNCIÓN GENÉRICA PARA CREAR BOTONES
    createMenuButton(x, y, text, callback) {
        const container = this.add.container(x, y);
        
        const buttonWidth = 200;
        const buttonHeight = 60;
        const graphics = this.add.graphics();
        
        // Dibujamos el fondo inicial
        this.drawButtonStyle(graphics, buttonWidth, buttonHeight, 0x6c63ff);

        const txt = this.add.text(0, 0, text, {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        container.add([graphics, txt]);

        // Área de interacción
        const hitArea = new Phaser.Geom.Rectangle(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight);
        container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

        // --- EFECTOS INTERACTIVOS ---
        container.on('pointerover', () => {
            this.input.setDefaultCursor('pointer');
            this.drawButtonStyle(graphics, buttonWidth, buttonHeight, 0x8b83ff); // Color más claro
            this.tweens.add({ targets: container, scale: 1.05, duration: 100 });
        });

        container.on('pointerout', () => {
            this.input.setDefaultCursor('default');
            this.drawButtonStyle(graphics, buttonWidth, buttonHeight, 0x6c63ff); // Color original
            this.tweens.add({ targets: container, scale: 1, duration: 100 });
        });

        container.on('pointerdown', () => {
            this.tweens.add({ targets: container, scale: 0.95, duration: 50 });
        });

        container.on('pointerup', () => {
            callback();
        });

        return container;
    }

    drawButtonStyle(graphics, w, h, color) {
        graphics.clear();
        graphics.fillStyle(color, 1);
        graphics.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
    }
}
