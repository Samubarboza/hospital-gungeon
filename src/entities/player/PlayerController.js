export class PlayerController {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.facing = 'down';

        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.keys = this.scene.input.keyboard.addKeys('W,A,S,D,R,SPACE,K');
        this.scene.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                this.handleShoot();
            }
        });
    }

   update() {
    if (!this.player || !this.player.stats) return;
    if (this.player.stats.isDead) return;

    // 1. EL ÚNICO BLOQUEO: Solo el knockback físico detiene el teclado
    if (this.player.stats.isKnockedBack) return; 

    // 2. PROCESAR MOVIMIENTO (Sin bloqueos, para que sea fluido)
    this.handleMovement();

    // 3. PROCESAR INPUTS (R, SPACE, K)
    if (Phaser.Input.Keyboard.JustDown(this.keys.R)) this.handleReload();
    if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) this.handleMelee();
    if (Phaser.Input.Keyboard.JustDown(this.keys.K)) this.player.receiveHit(20);

    // 4. ANIMACIONES (Al final, y solo si no está haciendo algo importante)
    this.handleAnimations();
}
    // src/entities/player/PlayerController.js

handleShoot() {
    const stats = this.player.stats;

    // 1. BLOQUEOS: Solo si está muerto o ya está recargando.
    // Quitamos 'isAttacking' de aquí para poder disparar mientras nos movemos.
    if (stats.isDead || stats.isReloading) return;

    // 2. LÓGICA DE DISPARO LIMITADO
    if (stats.currentAmmo > 0) {
        const pointer = this.scene.input.activePointer;
        const targetX = pointer.worldX ?? pointer.x;
        const targetY = pointer.worldY ?? pointer.y;
        const baseAngle = Phaser.Math.Angle.Between(
            this.player.x,
            this.player.y,
            targetX,
            targetY
        );

        const shotCount = Math.max(stats.shotCount || 1, 1);
        const spreadRad = Phaser.Math.DegToRad(stats.shotSpread || 0);
        let fired = 0;

        for (let i = 0; i < shotCount; i += 1) {
            const bullet = this.player.bullets.get(this.player.x, this.player.y);
            if (!bullet) break;
            const offset = spreadRad > 0
                ? Phaser.Math.FloatBetween(-spreadRad * 0.5, spreadRad * 0.5)
                : 0;
            bullet.fire(this.player.x, this.player.y, baseAngle + offset);
            fired += 1;
        }

        if (fired > 0) {
            // Reducción de munición
            stats.currentAmmo = Math.max(stats.currentAmmo - (stats.ammoPerShot || 1), 0);
            console.log(`Balas restantes: ${stats.currentAmmo}`);

            // 3. ANIMACIÓN DE DISPARO (EL CAMBIO CLAVE)
            const moving = this.player.body.velocity.lengthSq() > 1;
            const actionKey = moving
                ? (this.scene.anims.exists('player-runThrow') ? 'player-runThrow' : 'player-throw')
                : 'player-throw';

            // IMPORTANTE: Usamos anims.play directamente. 
            // Esto evita que playAction active el flag 'isBusy' que te congela en el update.
            this.player.anims.play(actionKey, true);

            // --- RECARGA AUTOMÁTICA ---
            if (stats.currentAmmo === 0) {
                console.log("¡Cargador vacío! Recargando...");
                this.handleReload();
            }
        }
    } else {
        // Si intenta disparar sin balas
        this.handleReload();
    }
}
    handleReload() {
        const stats = this.player.stats;
        
        // No recargar si ya lo está haciendo o si tiene el cargador lleno
        if (stats.isReloading || stats.currentAmmo === stats.maxAmmo) return;

        stats.isReloading = true;
        console.log("Recargando...");

        this.scene.time.delayedCall(1500, () => {
            if (!this.player.active) return;
            stats.currentAmmo = stats.maxAmmo;
            stats.isReloading = false;
            console.log("¡Recarga lista!");
        });
    }

    // El resto de tus métodos (handleMelee, handleMovement, handleAnimations, etc.) 
    // se mantienen igual que en tu código base.
   // src/entities/player/PlayerController.js

handleMelee() {
    if (this.player.stats.isAttacking) return;

    // Marcamos que está atacando
    this.player.stats.isAttacking = true;
    
    // Ejecutamos la única animación de ataque
    const actionKey = 'player-slash'; 
    this.player.anims.play(actionKey, true);
    console.log("¡Ataque cuerpo a cuerpo ejecutado!");

    // DESBLOQUEO: Tras 300ms puede volver a caminar normal o atacar
    this.scene.time.delayedCall(300, () => {
        if (this.player.stats) this.player.stats.isAttacking = false;
    });
}

    handleMovement() {
        const { speed } = this.player.stats;
        let vx = 0; let vy = 0;
        if (this.cursors.left.isDown || this.keys.A.isDown) vx = -speed;
        else if (this.cursors.right.isDown || this.keys.D.isDown) vx = speed;
        if (this.cursors.up.isDown || this.keys.W.isDown) vy = -speed;
        else if (this.cursors.down.isDown || this.keys.S.isDown) vy = speed;
        this.player.setVelocity(vx, vy);
        if (vx !== 0 && vy !== 0) {
            this.player.body.velocity.normalize().scale(speed);
        }
    }

    handleAnimations() {
        if (this.player.stats.isAttacking || this.player.stats.isInvulnerable) return;
        const { x, y } = this.player.body.velocity;
        const speed = Math.abs(x) + Math.abs(y);
        const now = this.scene.time.now;
        const nextIdleBlinkAt = this.player.getData('nextIdleBlinkAt') || 0;
        const nextEmoteAt = this.player.getData('nextEmoteAt') || 0;

        if (x < 0) {
            this.facing = 'left'; this.player.setFlipX(true);
            if (this.scene.anims.exists('player-run') && speed > this.player.stats.speed * 1.2) {
                this.playIfAvailable('player-run');
            } else {
                this.playIfAvailable('walk-right') || this.playIfAvailable('player-walk');
            }
            return;
        }
        if (x > 0) {
            this.facing = 'right'; this.player.setFlipX(false);
            if (this.scene.anims.exists('player-run') && speed > this.player.stats.speed * 1.2) {
                this.playIfAvailable('player-run');
            } else {
                this.playIfAvailable('walk-right') || this.playIfAvailable('player-walk');
            }
            return;
        }
        if (y < 0) {
            this.facing = 'up'; this.player.setFlipX(false);
            this.playIfAvailable('walk-up') || this.playIfAvailable('player-walk');
            return;
        }
        if (y > 0) {
            this.facing = 'down'; this.player.setFlipX(false);
            this.playIfAvailable('walk-down') || this.playIfAvailable('player-walk');
            return;
        }

        this.player.setFlipX(this.facing === 'left');
        if (now >= nextEmoteAt && (this.scene.anims.exists('player-taunt') || this.scene.anims.exists('player-cast'))) {
            this.player.setData('nextEmoteAt', now + Phaser.Math.Between(5000, 9000));
            const emote = this.scene.anims.exists('player-cast') && Phaser.Math.Between(0, 1) === 0 ? 'player-cast' : 'player-taunt';
            this.player.playAction(emote, true);
            return;
        }
        if (this.scene.anims.exists('player-idleBlink') && now >= nextIdleBlinkAt) {
            this.player.setData('nextIdleBlinkAt', now + Phaser.Math.Between(2000, 5000));
            this.player.playAction('player-idleBlink', true);
            return;
        }
        this.playIfAvailable('idle') || this.playIfAvailable('player-idle');
    }

    playIfAvailable(key) {
        const anim = this.scene.anims.get(key);
        if (!anim || !anim.frames || anim.frames.length === 0) return false;
        this.player.anims.play(key, true);
        return true;
    }

    playJumpAttack() {
        if (!this.scene.anims.exists('player-jumpStart')) return false;
        this.player.isBusy = true;
        this.player.anims.play('player-jumpStart', true);
        this.player.once('animationcomplete-player-jumpStart', () => {
            if (!this.player.active) return;
            if (this.scene.anims.exists('player-jumpLoop')) this.player.anims.play('player-jumpLoop', true);
            this.scene.time.delayedCall(350, () => {
                if (!this.player.active) return;
                const airAction = this.scene.anims.exists('player-slashAir') ? 'player-slashAir' : this.scene.anims.exists('player-throwAir') ? 'player-throwAir' : null;
                if (airAction) {
                    this.player.anims.play(airAction, true);
                    this.player.once(`animationcomplete-${airAction}`, () => this.finishJump());
                } else this.finishJump();
            });
        });
        return true;
    }

    finishJump() {
        if (!this.player.active) return;
        if (this.scene.anims.exists('player-fall')) {
            this.player.anims.play('player-fall', true);
            this.player.once('animationcomplete-player-fall', () => {
                if (!this.player.active) return;
                this.player.isBusy = false;
                this.player.stats.isAttacking = false;
            });
            return;
        }
        this.player.isBusy = false;
        this.player.stats.isAttacking = false;
    }
}