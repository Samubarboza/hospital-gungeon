import { eventBus } from '../core/EventBus.js';
import { sceneManager } from '../core/SceneManager.js';

export class Start extends Phaser.Scene {
    constructor() {
        super('Start');
    }
    // 1. Carga la imagen
    preload() {
        this.load.image('background', 'public/assets/HospitalGungeonMenu.png'); // Ajusta la ruta a tu archivo
    }

    create() {
        // Para que la imagen ocupe toda la pantalla automáticamente:
        this.add.image(0, 0, 'background').setOrigin(0, 0).setDisplaySize(this.sys.canvas.width, this.sys.canvas.height);

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Crear el botón minimalista
        const button = this.createButton(centerX, centerY, 'EMPEZAR');
    }

    createButton(x, y, text) {
        // Contenedor del botón
        const container = this.add.container(x, y);

        // Fondo del botón (rectángulo redondeado)
        const buttonBg = this.add.graphics();
        const buttonWidth = 200;
        const buttonHeight = 60;
        const cornerRadius = 10;

        // Dibujar el botón
        this.drawButton(buttonBg, buttonWidth, buttonHeight, cornerRadius, 0x6c63ff);

        // Texto del botón
        const buttonText = this.add.text(0, 0, text, {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Agregar elementos al contenedor
        container.add([buttonBg, buttonText]);

        // Zona interactiva (hitArea)
        const hitArea = new Phaser.Geom.Rectangle(
            -buttonWidth / 2,
            -buttonHeight / 2,
            buttonWidth,
            buttonHeight
        );
        container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

        // Estado normal
        const normalScale = 1;
        const hoverScale = 1.05;
        const clickScale = 0.95;

        // Evento: Mouse sobre el botón (hover)
        container.on('pointerover', () => {
            this.tweens.add({
                targets: container,
                scaleX: hoverScale,
                scaleY: hoverScale,
                duration: 150,
                ease: 'Power2'
            });

            // Cambiar color en hover
            buttonBg.clear();
            this.drawButton(buttonBg, buttonWidth, buttonHeight, cornerRadius, 0x8b83ff);

            // Cambiar cursor
            this.input.setDefaultCursor('pointer');
        });

        // Evento: Mouse fuera del botón
        container.on('pointerout', () => {
            this.tweens.add({
                targets: container,
                scaleX: normalScale,
                scaleY: normalScale,
                duration: 150,
                ease: 'Power2'
            });

            // Restaurar color
            buttonBg.clear();
            this.drawButton(buttonBg, buttonWidth, buttonHeight, cornerRadius, 0x6c63ff);

            // Restaurar cursor
            this.input.setDefaultCursor('default');
        });



        // Evento: Click presionado
        container.on('pointerdown', () => {
            this.tweens.add({
                targets: container,
                scaleX: clickScale,
                scaleY: clickScale,
                duration: 100,
                ease: 'Power2'
            });
        });

        // Evento: Click liberado (acción principal)
        container.on('pointerup', () => {
            this.tweens.add({
                targets: container,
                scaleX: hoverScale,
                scaleY: hoverScale,
                duration: 100,
                ease: 'Power2'
            });

            eventBus.emit('game:start');
            sceneManager.go(this, 'MenuScene');
        });

        return container;
    }

    drawButton(graphics, width, height, radius, color) {
        graphics.fillStyle(color, 1);
        graphics.fillRoundedRect(
            -width / 2,
            -height / 2,
            width,
            height,
            radius
        );
    }
}