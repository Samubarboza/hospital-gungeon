export class PlayerController {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;

        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.keys = this.scene.input.keyboard.addKeys('W,A,S,D,R,SPACE,K');
        this.scene.input.on('pointerdown', (pointer) => {
            if (pointer.leftButtonDown()) {
                this.handleShoot();
            }
        });
    }

    update() {
        this.handleMovement(); // Bloque 1: Física
        this.handleAnimations(); // Bloque 2: Visuales
        // Si presionas R y tienes menos balas que el máximo, recarga
        if (Phaser.Input.Keyboard.JustDown(this.keys.R)) {
            this.handleReload();
        }
        // Lógica de Golpe (Melee)
        if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
            this.handleMelee();
        }

        // 3. PRUEBA DE DAÑO: Si presionas K, el jugador pierde 10 de vida

        if (Phaser.Input.Keyboard.JustDown(this.keys.K)) {
            this.player.stats.takeDamage(10);
        }
    }
    handleMelee() {
        if (this.player.stats.isAttacking) return; // Si ya está golpeando, salimos

        this.player.stats.isAttacking = true;
        this.player.anims.play('walk-down', true); // Aquí usarás tu animación de ataque cuando la tengas
        console.log("¡Haciendo daño cuerpo a cuerpo!");

        // Simulamos que el golpe dura 300 milisegundos
        this.scene.time.delayedCall(300, () => {
            this.player.stats.isAttacking = false;
        });
    }

    handleMovement() {
        const { speed } = this.player.stats; // "Destructuring": sacamos la velocidad para escribir menos
        let vx = 0; // Velocidad en X
        let vy = 0; // Velocidad en Y

        // Eje X (Izquierda / Derecha)
        if (this.cursors.left.isDown || this.keys.A.isDown) vx = -speed;
        else if (this.cursors.right.isDown || this.keys.D.isDown) vx = speed;

        // Eje Y (Arriba / Abajo)
        if (this.cursors.up.isDown || this.keys.W.isDown) vy = -speed;
        else if (this.cursors.down.isDown || this.keys.S.isDown) vy = speed;

        this.player.setVelocity(vx, vy);

        // Si se mueve en diagonal, normalizamos para que no sea un "Súper Velocista"
        if (vx !== 0 && vy !== 0) {
            this.player.body.velocity.normalize().scale(speed);
        }
    }

    handleAnimations() {
        const { x, y } = this.player.body.velocity; // Miramos hacia dónde se mueve físicamente

        if (x < 0) this.player.anims.play('walk-left', true);
        else if (x > 0) this.player.anims.play('walk-right', true);
        else if (y < 0) this.player.anims.play('walk-up', true);
        else if (y > 0) this.player.anims.play('walk-down', true);
        else this.player.anims.play('idle', true); // Si x e y son 0
    }
    handleShoot() {
        const stats = this.player.stats;

        // Solo disparamos si hay balas y NO estamos recargando
        if (stats.currentAmmo > 0 && !stats.isReloading) {
            const bullet = this.player.bullets.get(this.player.x, this.player.y);
            if (bullet) {
                // Calculamos el ángulo hacia donde apunta el mouse
                const angle = Phaser.Math.Angle.Between(
                    this.player.x, this.player.y,
                    this.scene.input.activePointer.x, this.scene.input.activePointer.y
                );
                bullet.fire(this.player.x, this.player.y, angle);
                stats.currentAmmo--; // Restamos una bala
                console.log("Balas restantes:", stats.currentAmmo);
            }
        }

    }
    handleReload() {
        const stats = this.player.stats;
        if (stats.isReloading || stats.currentAmmo === stats.maxAmmo) return;

        stats.isReloading = true;
        console.log("Recargando...");

        // Usamos un temporizador: en 1.5 segundos se llena el cargador
        this.scene.time.delayedCall(1500, () => {
            stats.currentAmmo = stats.maxAmmo;
            stats.isReloading = false;
            console.log("¡Recarga lista!");
        });
    }
}
