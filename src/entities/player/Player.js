// src/entities/player/Player.js
import { PlayerController } from './PlayerController.js';
import { PlayerStats } from './PlayerStats.js';
import { Bullet } from './bullet.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, scale = 1) {
    const textureKey = scene.registry.get('playerTextureKey') || 'player';
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);

    const baseScale = scene.registry.get('playerScale') || 1;
    this.setScale(scale * baseScale);
    const bodyWidth = this.displayWidth * 0.3;
    const bodyHeight = this.displayHeight * 0.45;
    this.body.setSize(bodyWidth, bodyHeight);
    this.body.setOffset(
      (this.displayWidth - bodyWidth) / 2,
      this.displayHeight - bodyHeight
    );

    this.stats = new PlayerStats();
    this.controller = new PlayerController(scene, this);

    this.bullets = scene.physics.add.group({
      classType: Bullet,
      maxSize: 250,
      runChildUpdate: true
    });

    this.isBusy = false;
    this.invulnerableUntil = 0;
    this.setData('nextIdleBlinkAt', scene.time.now + Phaser.Math.Between(2000, 5000));
    this.setData('nextEmoteAt', scene.time.now + Phaser.Math.Between(3000, 7000));
  }

  update() {
    this.controller.update();
  }

  playAction(actionKey, lock = true) {
    const anim = this.scene.anims.get(actionKey);
    if (!anim || !anim.frames || anim.frames.length === 0) return false;
    if (this.isBusy && lock) return false;
    this.isBusy = lock;
    this.anims.play(actionKey, true);
    if (lock) {
      this.once(`animationcomplete-${actionKey}`, () => {
        if (!this.active) return;
        this.isBusy = false;
      });
    }
    return true;
  }

  receiveHit(damage) {
    const now = this.scene.time.now;
    if (now < this.invulnerableUntil) return;
    this.invulnerableUntil = now + 450;

    this.stats.takeDamage(damage);
    
    if (this.stats.isDead) {
        this.die();
    } else {
        // EFECTO VISUAL: Un solo parpadeo de 200ms para que se note
        this.setTint(0xff0000); 
        this.scene.time.delayedCall(200, () => {
            if (this.active) this.clearTint(); 
        });
        this.playAction('player-hurt', false);
    }
  }

  die() {
    console.log("¡PERSONAJE ELIMINADO!");
    this.setVelocity(0, 0);
    this.body.enable = false; 
    this.setTint(0x444444); // Gris de muerte

    if (this.scene.anims.exists('player-dying')) {
        this.playAction('player-dying', true);
        this.once('animationcomplete-player-dying', () => {
            if (!this.active) return;
            this.scene.scene.restart();
        });
    } else {
        this.scene.time.delayedCall(3000, () => {
            this.scene.scene.restart();
        });
    }
  }
} // <--- ESTA LLAVE CIERRA LA CLASE Y EVITA EL ERROR QUE TENÍAS
