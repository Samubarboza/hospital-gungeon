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
    this.meleeActiveUntil = 0;
    this.meleeHitIds = new Set();
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

  // src/entities/player/Player.js

receiveHit(damage, attacker = null) {
    // 1. ESCUDO DE SEGURIDAD: Si es invulnerable o ya murió, ignoramos el golpe
    if (this.stats.isInvulnerable || this.stats.isDead) return;

    // 2. APLICAR DAÑO
    this.stats.takeDamage(damage);

    // 3. LÓGICA DE REACCIÓN FÍSICA (Knockback)
    if (attacker && !this.stats.isDead) {
        // Calculamos la dirección opuesta al atacante
        const angle = Phaser.Math.Angle.Between(attacker.x, attacker.y, this.x, this.y);
        const force = 120; // Ajusta este número para más o menos "peso"
        
        this.setVelocity(Math.cos(angle) * force, Math.sin(angle) * force);
    }
    this.stats.isKnockedBack = true;
        this.scene.time.delayedCall(120, () => {
            if (this.stats) this.stats.isKnockedBack = false;
        });
    

    // 4. VERIFICAR MUERTE
    if (this.stats.isDead) {
        this.die();
        return;
    }

    // 5. ESTADO DE INVULNERABILIDAD TEMPORAL
    this.stats.isInvulnerable = true;
    
    // Feedback visual inmediato (Rojo)
    this.setTint(0xff0000);
    this.scene.time.delayedCall(200, () => {
        if (this.active) this.clearTint();
    });

    // Efecto de parpadeo (Retro) durante la invulnerabilidad
    const blinkTimer = this.scene.time.addEvent({
        delay: 100,
        callback: () => { this.visible = !this.visible; },
        repeat: 10 // Parpadea durante 1 segundo aprox.
    });

    // 6. RESTAURACIÓN
    this.scene.time.delayedCall(1000, () => {
        this.stats.isInvulnerable = false;
        this.visible = true; // Aseguramos que sea visible al terminar
        blinkTimer.remove();
    });
}

  die() {
    this.setVelocity(0, 0);
    this.body.enable = false; 
    this.setTint(0x444444); // Gris de muerte

    if (this.scene.anims.exists('player-dying')) {
        this.playAction('player-dying', true);
        this.once('animationcomplete-player-dying', () => {
            if (!this.active) return;
            const sector = this.scene?.sector;
            this.scene.scene.restart(sector ? { sector } : {});
        });
    } else {
        this.scene.time.delayedCall(3000, () => {
            const sector = this.scene?.sector;
            this.scene.scene.restart(sector ? { sector } : {});
        });
    }
  }
} // <--- ESTA LLAVE CIERRA LA CLASE Y EVITA EL ERROR QUE TENÍAS
