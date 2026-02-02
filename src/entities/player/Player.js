// src/entities/player/Player.js
import { PlayerController } from './PlayerController.js';
import { PlayerStats } from './PlayerStats.js';
import { Bullet } from './bullet.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player'); 
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true); 
    
    this.setScale(0.2);
    this.body.setSize(120, 140);
    this.body.setOffset(65, 60); 

    this.stats = new PlayerStats();
    this.controller = new PlayerController(scene, this);

    this.bullets = scene.physics.add.group({
      classType: Bullet,
      maxSize: 10,
      runChildUpdate: true 
    });
  }

  update() {
    this.controller.update();
  }

  receiveHit(damage) {
    this.stats.takeDamage(damage);
    
    if (this.stats.isDead) {
        this.die();
    } else {
        // EFECTO VISUAL: Un solo parpadeo de 200ms para que se note
        this.setTint(0xff0000); 
        this.scene.time.delayedCall(200, () => {
            if (this.active) this.clearTint(); 
        });
    }
  }

  die() {
    console.log("¡PERSONAJE ELIMINADO!");
    this.setVelocity(0, 0);
    this.body.enable = false; 
    this.setTint(0x444444); // Gris de muerte

    this.scene.time.delayedCall(3000, () => {
        this.scene.scene.restart();
    });
  }
} // <--- ESTA LLAVE CIERRA LA CLASE Y EVITA EL ERROR QUE TENÍAS