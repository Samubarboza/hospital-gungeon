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
        if (this.player.stats.isDead) return;

        if (this.player.isBusy && this.player.stats.isAttacking) {
            this.player.setVelocity(0, 0);
            return;
        }

        this.handleMovement();
        this.handleAnimations();

        if (Phaser.Input.Keyboard.JustDown(this.keys.R)) {
            this.handleReload();
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
            this.handleMelee();
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.K)) {
            this.player.receiveHit(20);
        }
    }

    handleMelee() {
        if (this.player.stats.isAttacking) return;

        const moving = this.player.body.velocity.lengthSq() > 1;
        const roll = Phaser.Math.Between(0, 99);
        let actionKey = null;

        if (moving && roll < 15 && this.scene.anims.exists('player-slide')) {
            actionKey = 'player-slide';
        } else if (moving && roll < 30 && this.scene.anims.exists('player-jumpStart')) {
            if (this.playJumpAttack()) {
                this.player.stats.isAttacking = true;
                return;
            }
        } else if (moving && this.scene.anims.exists('player-runSlash')) {
            actionKey = 'player-runSlash';
        } else if (this.scene.anims.exists('player-kick') && roll < 60) {
            actionKey = 'player-kick';
        } else {
            actionKey = 'player-slash';
        }

        if (actionKey && this.player.playAction(actionKey, true)) {
            this.player.stats.isAttacking = true;
            this.player.once(`animationcomplete-${actionKey}`, () => {
                if (!this.player.active) return;
                this.player.stats.isAttacking = false;
            });
        }
    }

    handleMovement() {
        const { speed } = this.player.stats;
        let vx = 0;
        let vy = 0;

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
        if (this.player.isBusy) return;
        const { x, y } = this.player.body.velocity;
        const speed = Math.abs(x) + Math.abs(y);
        const now = this.scene.time.now;
        const nextIdleBlinkAt = this.player.getData('nextIdleBlinkAt') || 0;
        const nextEmoteAt = this.player.getData('nextEmoteAt') || 0;

        if (x < 0) {
            this.facing = 'left';
            this.player.setFlipX(true);
            if (this.scene.anims.exists('player-run') && speed > this.player.stats.speed * 1.2) {
                this.playIfAvailable('player-run');
            } else {
                this.playIfAvailable('walk-right') || this.playIfAvailable('player-walk');
            }
            return;
        }
        if (x > 0) {
            this.facing = 'right';
            this.player.setFlipX(false);
            if (this.scene.anims.exists('player-run') && speed > this.player.stats.speed * 1.2) {
                this.playIfAvailable('player-run');
            } else {
                this.playIfAvailable('walk-right') || this.playIfAvailable('player-walk');
            }
            return;
        }
        if (y < 0) {
            this.facing = 'up';
            this.player.setFlipX(false);
            this.playIfAvailable('walk-up') || this.playIfAvailable('player-walk');
            return;
        }
        if (y > 0) {
            this.facing = 'down';
            this.player.setFlipX(false);
            this.playIfAvailable('walk-down') || this.playIfAvailable('player-walk');
            return;
        }

        this.player.setFlipX(this.facing === 'left');
        if (now >= nextEmoteAt && (this.scene.anims.exists('player-taunt') || this.scene.anims.exists('player-cast'))) {
            this.player.setData('nextEmoteAt', now + Phaser.Math.Between(5000, 9000));
            const emote = this.scene.anims.exists('player-cast') && Phaser.Math.Between(0, 1) === 0
                ? 'player-cast'
                : 'player-taunt';
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

    handleShoot() {
        const stats = this.player.stats;
        if (stats.isDead) return;
        if (this.player.stats.isAttacking) return;

        if (stats.currentAmmo > 0 && !stats.isReloading) {
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
                stats.currentAmmo = Math.max(stats.currentAmmo - (stats.ammoPerShot || 1), 0);
                const moving = this.player.body.velocity.lengthSq() > 1;
                const actionKey = moving
                    ? this.scene.anims.exists('player-runThrow') ? 'player-runThrow' : 'player-throw'
                    : 'player-throw';
                this.player.playAction(actionKey, false);
            }
        }
    }

    playJumpAttack() {
        if (!this.scene.anims.exists('player-jumpStart')) return false;
        this.player.isBusy = true;
        this.player.anims.play('player-jumpStart', true);
        this.player.once('animationcomplete-player-jumpStart', () => {
            if (!this.player.active) return;
            if (this.scene.anims.exists('player-jumpLoop')) {
                this.player.anims.play('player-jumpLoop', true);
            }
            this.scene.time.delayedCall(350, () => {
                if (!this.player.active) return;
                const airAction = this.scene.anims.exists('player-slashAir')
                    ? 'player-slashAir'
                    : this.scene.anims.exists('player-throwAir')
                        ? 'player-throwAir'
                        : null;
                if (airAction) {
                    this.player.anims.play(airAction, true);
                    this.player.once(`animationcomplete-${airAction}`, () => this.finishJump());
                } else {
                    this.finishJump();
                }
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

    handleReload() {
        const stats = this.player.stats;
        if (stats.isReloading || stats.currentAmmo === stats.maxAmmo) return;

        stats.isReloading = true;

        this.scene.time.delayedCall(1500, () => {
            stats.currentAmmo = stats.maxAmmo;
            stats.isReloading = false;
        });
    }
}
