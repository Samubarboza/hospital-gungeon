// src/entities/player/Bullet.js

export class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // Llamamos al constructor padre con el sprite 'bullet'
        super(scene, x, y, 'bullet'); 
    }

    fire(x, y, angle) {
        this.enableBody(true, x, y, true, true); // Activa la bala en la posición x, y
        this.setRotation(angle); // Gira la bala hacia el mouse
        if (this.body) {
            this.body.setAllowGravity(false);
            const radius = 6;
            this.body.setCircle(radius);
            this.body.setOffset(
                (this.width - radius * 2) / 2,
                (this.height - radius * 2) / 2
            );
        }
        
        // Usamos trigonometría para la velocidad:
        // angle es la dirección y 600 es la velocidad
        this.scene.physics.velocityFromRotation(angle, 500, this.body.velocity);
    }

    update() {
        const bounds = this.scene.physics.world.bounds;
        if (
            this.x < bounds.x - 50 ||
            this.x > bounds.right + 50 ||
            this.y < bounds.y - 50 ||
            this.y > bounds.bottom + 50
        ) {
            this.disableBody(true, true);
        }
    }
}
