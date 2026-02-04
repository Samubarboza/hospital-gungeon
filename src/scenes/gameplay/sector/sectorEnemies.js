const AI_TUNING = {
    detectionRange: 420,
    walker: { speedMin: 190, speedMax: 230, damage: 16, attackRange: 80, attackCooldown: 480 },
    shooter: { speedMin: 170, speedMax: 200, damage: 14, attackRange: 260, idealDistance: 190, attackCooldown: 650 },
    hybrid: { speedMin: 210, speedMax: 250, damage: 20, attackRange: 90, attackCooldown: 420 },
    fast: { speedMin: 240, speedMax: 280, damage: 18, attackRange: 80, attackCooldown: 420 }
};

export function createEnemySystem(scene) {
    const enemySystem = {
        spawnEnemy,
        spawnBoss,
        update,
        updateEnemies,
        playEnemyAction,
        playBossAction,
        playEnemyHurt,
        playBossHurt,
        playEnemyDeath,
        playBossDeath,
        isEnemyBusy,
        isBossBusy
    };

    function update(time, delta) {
        if (scene.enemyFactory) {
            scene.enemyFactory.updateAll(time, delta);
        }
        updateEnemies();
    }

    function updateEnemies() {
        const now = scene.time.now;
        scene.enemies.getChildren().forEach((enemy) => {
            if (!enemy.active) return;
            if (enemy.getData('isBoss')) {
                updateBoss(enemy, now);
                return;
            }
            if (enemy.stateMachine) {
                return;
            }
            if (isEnemyBusy(enemy)) {
                enemy.setVelocity(0, 0);
                return;
            }
            maybeTriggerEnemyEmote(enemy, now);
            moveEnemyTowardPlayer(enemy);
            updateEnemyAnim(enemy, now);
        });
    }

    function spawnEnemy(x, y, enemyData = {}) {
        if (enemyData.type === 'boss') {
            spawnBoss(x, y, enemyData);
            return;
        }
        const variant = enemyData.variant || Phaser.Utils.Array.GetRandom(scene.enemyVariants);
        const textureKey = variant ? `${variant}-walk-000` : scene.enemyDefaultTexture;
        const isFast = enemyData.type === 'fast';
        const enemyType = enemyData.type === 'shooter'
            ? scene.enemyFactory.constructor.TYPES.SHOOTER
            : enemyData.type === 'hybrid'
                ? scene.enemyFactory.constructor.TYPES.HYBRID
                : scene.enemyFactory.constructor.TYPES.WALKER;

        const animKeys = variant && variant !== 'default'
            ? {
                walk: scene.enemyAnimMap.walk[variant],
                idle: scene.enemyAnimMap.idle[variant],
                idleBlink: scene.enemyAnimMap.idleBlink[variant],
                attack: scene.enemyAnimMap.attack[variant],
                hurt: scene.enemyAnimMap.hurt[variant],
                dying: scene.enemyAnimMap.dying[variant]
            }
            : {};

        const tuning = enemyType === scene.enemyFactory.constructor.TYPES.SHOOTER
            ? AI_TUNING.shooter
            : enemyType === scene.enemyFactory.constructor.TYPES.HYBRID
                ? AI_TUNING.hybrid
                : isFast
                    ? AI_TUNING.fast
                    : AI_TUNING.walker;

        const speed = enemyData.speed ?? Phaser.Math.Between(tuning.speedMin, tuning.speedMax);
        const damage = enemyData.damage ?? tuning.damage;
        const attackRange = enemyData.attackRange ?? tuning.attackRange;
        const attackCooldown = enemyData.attackCooldown ?? tuning.attackCooldown;
        const detectionRange = enemyData.detectionRange ?? AI_TUNING.detectionRange;
        const separationScale = (scene.roomScaleX + scene.roomScaleY) * 0.5;
        const separationRadius = enemyData.separationRadius ?? 70 * separationScale;
        const separationStrength = enemyData.separationStrength ?? 140 * separationScale;

        const enemyConfig = {
            texture: textureKey,
            variant: variant || 'default',
            animKeys,
            health: enemyData.hp ?? 30,
            speed,
            damage,
            detectionRange,
            attackRange,
            attackCooldown,
            scale: 0.25,
            separationGroup: scene.enemies,
            separationRadius,
            separationStrength
        };

        if (tuning.idealDistance !== undefined) {
            enemyConfig.idealDistance = enemyData.idealDistance ?? tuning.idealDistance;
        }

        const enemy = scene.enemyFactory.create(enemyType, x, y, enemyConfig);

        if (!enemy) return;
        if (typeof enemy.setPlayer === 'function') {
            enemy.setPlayer(scene.player);
        }
        enemy.setDepth(9);
        scene.enemies.add(enemy);
    }

    function spawnBoss(x, y, config = {}) {
        const textureKey = `${scene.bossId}-idle-000`;
        const boss = scene.physics.add.sprite(x, y, textureKey);
        boss.setOrigin(0.5, 1);
        boss.setData('isBoss', true);
        boss.setData('state', 'idle');
        boss.setData('variant', scene.bossId);
        boss.setData('hp', config.hp ?? 900);
        boss.setData('speed', config.speed ?? 130);
        boss.setData('isDying', false);
        boss.setData('nextActionAt', scene.time.now + 800);
        boss.setData('nextEmoteAt', scene.time.now + 1500);
        boss.setData('nextJumpAt', scene.time.now + 3000);
        boss.setScale(config.scale ?? 0.36);
        boss.setDepth(10);
        const bodyWidth = boss.displayWidth * 0.6;
        const bodyHeight = boss.displayHeight * 0.6;
        boss.body.setSize(bodyWidth, bodyHeight);
        boss.body.setOffset(
            (boss.displayWidth - bodyWidth) / 2,
            boss.displayHeight - bodyHeight
        );
        if (scene.bossAnimMap.idle) {
            boss.anims.play(scene.bossAnimMap.idle, true);
        }
        scene.enemies.add(boss);
    }

    function updateBoss(boss, now) {
        if (boss.getData('isDying')) {
            boss.setVelocity(0, 0);
            return;
        }
        if (isBossBusy(boss)) {
            boss.setVelocity(0, 0);
            return;
        }

        const dist = Phaser.Math.Distance.Between(boss.x, boss.y, scene.player.x, scene.player.y);
        const nextActionAt = boss.getData('nextActionAt') || 0;
        const nextJumpAt = boss.getData('nextJumpAt') || 0;
        const nextHitAt = boss.getData('nextHitAt') || 0;

        if (dist < 140 && now >= nextHitAt) {
            const melee = pickBossAction(['kick', 'slash', 'runSlash']);
            if (melee) {
                playBossAction(boss, melee);
            }
            boss.setData('nextHitAt', now + 650);
            scene.player.receiveHit(20);
        }

        if (dist > 320 && now >= nextJumpAt) {
            startBossJump(boss, now);
            return;
        }

        if (now >= nextActionAt) {
            if (dist < 140) {
                const melee = pickBossAction(['kick', 'slash', 'runSlash', 'slide']);
                if (melee) {
                    playBossAction(boss, melee);
                }
                boss.setData('nextActionAt', now + Phaser.Math.Between(700, 1100));
            } else if (dist < 260) {
                const mid = pickBossAction(['throw', 'runThrow', 'slash']);
                if (mid) {
                    playBossAction(boss, mid);
                }
                boss.setData('nextActionAt', now + Phaser.Math.Between(900, 1300));
            } else if (dist >= 260) {
                const ranged = pickBossAction(['cast', 'taunt', 'runThrow', 'throw']);
                if (ranged) {
                    playBossAction(boss, ranged);
                }
                boss.setData('nextActionAt', now + Phaser.Math.Between(1200, 1600));
            }
        }

        const speed = boss.getData('speed');
        if (dist > 220 && scene.bossAnimMap.run) {
            boss.setVelocity(
                (scene.player.x - boss.x) * 0.004 * speed,
                (scene.player.y - boss.y) * 0.004 * speed
            );
            if (boss.body.velocity.x !== 0) {
                boss.setFlipX(boss.body.velocity.x < 0);
            }
            playBossLoop(boss, 'run');
            return;
        }

        if (dist > 120) {
            moveBossTowardPlayer(boss);
            playBossLoop(boss, 'walk');
        } else {
            boss.setVelocity(0, 0);
            playBossIdle(boss, now);
        }
    }

    function moveBossTowardPlayer(boss) {
        const speed = boss.getData('speed');
        scene.physics.moveToObject(boss, scene.player, speed);
        if (boss.body.velocity.x !== 0) {
            boss.setFlipX(boss.body.velocity.x < 0);
        }
    }

    function playBossIdle(boss, now) {
        if (scene.bossAnimMap.idleBlink) {
            const nextEmoteAt = boss.getData('nextEmoteAt') || 0;
            if (now >= nextEmoteAt) {
                boss.setData('nextEmoteAt', now + Phaser.Math.Between(2000, 4000));
                playBossAction(boss, 'idleBlink');
                return;
            }
        }
        playBossLoop(boss, 'idle');
    }

    function playBossLoop(boss, action) {
        const animKey = scene.bossAnimMap[action];
        if (!animKey) return;
        if (boss.anims.currentAnim?.key === animKey) return;
        boss.setData('state', action);
        boss.anims.play(animKey, true);
    }

    function pickBossAction(options) {
        const available = options.filter((action) => scene.bossAnimMap[action]);
        if (available.length === 0) return null;
        return Phaser.Utils.Array.GetRandom(available);
    }

    function startBossJump(boss, now) {
        boss.setData('nextJumpAt', now + Phaser.Math.Between(4500, 6500));
        const started = playBossAction(boss, 'jumpStart', {
            onComplete: () => {
                playBossLoop(boss, 'jumpLoop');
                scene.time.delayedCall(400, () => {
                    if (!boss.active) return;
                    const airAction = Phaser.Math.Between(0, 1) === 0 ? 'slashAir' : 'throwAir';
                    playBossAction(boss, airAction, {
                        force: true,
                        onComplete: () => playBossAction(boss, 'fall', { force: true })
                    });
                });
            }
        });
        return started;
    }

    function isBossBusy(boss) {
        const state = boss.getData('state');
        return state === 'hurt' ||
            state === 'attack' ||
            state === 'cast' ||
            state === 'taunt' ||
            state === 'idleBlink' ||
            state === 'jumpStart' ||
            state === 'jumpLoop' ||
            state === 'fall' ||
            state === 'slide' ||
            state === 'kick' ||
            state === 'slash' ||
            state === 'runSlash' ||
            state === 'throw' ||
            state === 'runThrow' ||
            state === 'throwAir' ||
            state === 'slashAir' ||
            state === 'dying';
    }

    function isEnemyBusy(enemy) {
        const state = enemy.getData('state');
        return state === 'hurt' ||
            state === 'attack' ||
            state === 'cast' ||
            state === 'taunt' ||
            state === 'idleBlink' ||
            state === 'dying';
    }

    function maybeTriggerEnemyEmote(enemy, now) {
        const variant = enemy.getData('variant');
        if (!variant || variant === 'default') return;
        const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, scene.player.x, scene.player.y);
        const nextEmoteAt = enemy.getData('nextEmoteAt') || 0;
        if (now < nextEmoteAt) return;
        if (distance < 260) return;

        const roll = Phaser.Math.Between(0, 100);
        if (roll < 65) {
            playEnemyAction(enemy, 'cast');
        } else {
            playEnemyAction(enemy, 'taunt');
        }
        enemy.setData('nextEmoteAt', now + Phaser.Math.Between(3500, 7000));
    }

    function updateEnemyAnim(enemy, now) {
        if (isEnemyBusy(enemy)) return;
        const { x: vx, y: vy } = enemy.body.velocity;
        const speed = Math.abs(vx) + Math.abs(vy);
        const variant = enemy.getData('variant');
        const walkKey = variant && variant !== 'default' ? scene.enemyAnimMap.walk[variant] : null;
        const idleKey = variant && variant !== 'default' ? scene.enemyAnimMap.idle[variant] : null;
        const idleBlinkKey = variant && variant !== 'default' ? scene.enemyAnimMap.idleBlink[variant] : null;

        if (vx !== 0) {
            enemy.setFlipX(vx < 0);
        }

        if (speed <= 1 && idleBlinkKey) {
            const nextBlinkAt = enemy.getData('nextIdleBlinkAt') || 0;
            if (now >= nextBlinkAt) {
                enemy.setData('nextIdleBlinkAt', now + Phaser.Math.Between(2000, 5000));
                playEnemyAction(enemy, 'idleBlink');
                return;
            }
        }

        const nextAnim = speed > 1 ? walkKey : idleKey || walkKey;
        if (!nextAnim) return;
        if (enemy.anims.currentAnim?.key === nextAnim) return;
        enemy.anims.play(nextAnim, true);
    }

    function moveEnemyTowardPlayer(enemy) {
        const speed = enemy.getData('speed');
        const distToPlayer = Phaser.Math.Distance.Between(enemy.x, enemy.y, scene.player.x, scene.player.y);
        if (distToPlayer < 35) {
            enemy.setVelocity(0, 0);
            return;
        }

        const now = scene.time.now;
        const nextOffsetAt = enemy.getData('nextOffsetAt') || 0;
        let offset = enemy.getData('targetOffset') || { x: 0, y: 0 };
        if (distToPlayer < 140) {
            offset = { x: 0, y: 0 };
            enemy.setData('targetOffset', offset);
        } else if (now >= nextOffsetAt) {
            offset = {
                x: Phaser.Math.Between(-90, 90),
                y: Phaser.Math.Between(-90, 90)
            };
            enemy.setData('targetOffset', offset);
            enemy.setData('nextOffsetAt', now + Phaser.Math.Between(1200, 2200));
        }

        const targetX = scene.player.x + offset.x;
        const targetY = scene.player.y + offset.y;
        const toPlayer = new Phaser.Math.Vector2(
            targetX - enemy.x,
            targetY - enemy.y
        );
        if (toPlayer.lengthSq() > 0) {
            toPlayer.normalize().scale(speed);
        }

        const separation = new Phaser.Math.Vector2(0, 0);
        if (distToPlayer > 60) {
            const separationStrength = distToPlayer < 120
                ? scene.separationStrength * 0.3
                : scene.separationStrength;
            scene.enemies.getChildren().forEach((other) => {
                if (!other.active || other === enemy) return;
                const dx = enemy.x - other.x;
                const dy = enemy.y - other.y;
                const dist = Math.hypot(dx, dy);
                if (dist > 0 && dist < scene.separationRadius) {
                    const force = ((scene.separationRadius - dist) / scene.separationRadius) * separationStrength;
                    separation.x += (dx / dist) * force;
                    separation.y += (dy / dist) * force;
                }
            });
        }

        const velocity = new Phaser.Math.Vector2(
            toPlayer.x + separation.x,
            toPlayer.y + separation.y
        );
        if (velocity.lengthSq() > 0) {
            velocity.normalize().scale(speed);
        }
        enemy.setVelocity(velocity.x, velocity.y);
    }

    function playEnemyHurt(enemy) {
        playEnemyAction(enemy, 'hurt');
    }

    function playEnemyDeath(enemy) {
        if (enemy.getData('isDying')) return;
        enemy.setData('isDying', true);
        playEnemyAction(enemy, 'dying', {
            onComplete: () => {
                if (!enemy.active) return;
                enemy.destroy();
                scene.events.emit('enemyKilled', enemy);
            }
        });
    }

    function playEnemyAction(enemy, action, opts = {}) {
        const variant = enemy.getData('variant');
        const animKey = variant && variant !== 'default' ? scene.enemyAnimMap[action]?.[variant] : null;
        if (!animKey) return false;
        if (isEnemyBusy(enemy) && action !== 'dying' && action !== 'hurt') return false;

        enemy.setData('state', action);
        enemy.anims.play(animKey, true);
        enemy.once(`animationcomplete-${animKey}`, () => {
            if (!enemy.active) return;
            if (action !== 'dying') {
                enemy.setData('state', 'idle');
            }
            if (opts.onComplete) opts.onComplete();
        });
        return true;
    }

    function playBossHurt(boss) {
        playBossAction(boss, 'hurt');
    }

    function playBossDeath(boss) {
        if (boss.getData('isDying')) return;
        boss.setData('isDying', true);
        playBossAction(boss, 'dying', {
            onComplete: () => {
                if (!boss.active) return;
                boss.destroy();
                scene.events.emit('enemyKilled', boss);
            }
        });
    }

    function playBossAction(boss, action, opts = {}) {
        const animKey = scene.bossAnimMap[action];
        if (!animKey) return false;
        if (isBossBusy(boss) && !opts.force && action !== 'dying' && action !== 'hurt') return false;

        boss.setData('state', action);
        boss.anims.play(animKey, true);
        boss.once(`animationcomplete-${animKey}`, () => {
            if (!boss.active) return;
            if (action !== 'dying') {
                boss.setData('state', 'idle');
            }
            if (opts.onComplete) opts.onComplete();
        });
        return true;
    }

    return enemySystem;
}
