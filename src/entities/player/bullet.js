// src/entities/player/Bullet.js

export class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // Llamamos al constructor padre con el sprite 'bullet'
        super(scene, x, y, 'bullet'); 
    }

    fire(x, y, angle) {
        this.enableBody(true, x, y, true, true); // Activa la bala en la posición x, y
        this.setRotation(angle); // Gira la bala hacia el mouse
        
        // Usamos trigonometría para la velocidad:
        // angle es la dirección y 600 es la velocidad
        this.scene.physics.velocityFromRotation(angle, 600, this.body.velocity);
    }

    update() {
        // Si sale de la pantalla, la desactivamos para ahorrar memoria
        if (this.x < 0 || this.x > 1280 || this.y < 0 || this.y > 720) {
            this.disableBody(true, true);
        }
    }
}