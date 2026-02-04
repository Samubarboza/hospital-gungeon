import { eventBus } from '../core/EventBus.js';
import { sceneManager } from '../core/SceneManager.js';
import { Player } from '../entities/player/Player.js';
import { ROOM_TEMPLATES } from '../systems/rooms/RoomTemplates.js';
import { DoorSystem } from '../systems/rooms/DoorSystem.js';

export class SectorScene extends Phaser.Scene {
    constructor() {
        super('SectorScene');
        this.exitTriggered = false;
    }

    init(data) {
        this.sector = data.sector;
    }

    create() {
        this.scene.resume();
        this.physics.world.resume();
        this.physics.world.timeScale = 1;
        this.time.timeScale = 1;
        this.tweens.timeScale = 1;
        this.anims.globalTimeScale = 1;
        if (this.input?.keyboard) {
            this.input.keyboard.enabled = true;
            this.input.keyboard.addCapture([
                Phaser.Input.Keyboard.KeyCodes.UP,
                Phaser.Input.Keyboard.KeyCodes.DOWN,
                Phaser.Input.Keyboard.KeyCodes.LEFT,
                Phaser.Input.Keyboard.KeyCodes.RIGHT,
                Phaser.Input.Keyboard.KeyCodes.W,
                Phaser.Input.Keyboard.KeyCodes.A,
                Phaser.Input.Keyboard.KeyCodes.S,
                Phaser.Input.Keyboard.KeyCodes.D,
                Phaser.Input.Keyboard.KeyCodes.SPACE
            ]);
        }
        if (this.game?.canvas) {
            this.game.canvas.setAttribute('tabindex', '0');
            this.game.canvas.focus();
            this.input?.on('pointerdown', () => {
                this.game.canvas.focus();
            });
        }

        const mapImage = this.add.image(0, 0, 'sector-map').setOrigin(0, 0);
        const scale = Math.min(
            this.scale.width / mapImage.width,
            this.scale.height / mapImage.height
        );
        mapImage.setScale(scale);
        mapImage.setDepth(0);

        this.worldWidth = mapImage.displayWidth;
        this.worldHeight = mapImage.displayHeight;

        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);

        const starterTemplate = ROOM_TEMPLATES.starter;
        this.roomScaleX = this.worldWidth / starterTemplate.width;
        this.roomScaleY = this.worldHeight / starterTemplate.height;

        this.player = new Player(
            this,
            50 * this.roomScaleX,
            (starterTemplate.height * 0.5) * this.roomScaleY,
            1
        );
        this.player.setDepth(10);

        const showColliders = false;
        this.walls = this.physics.add.staticGroup();
        this.obstacles = this.physics.add.staticGroup();
        const addStaticRect = (group, x, y, width, height) => {
            const rect = this.add.rectangle(
                x,
                y,
                width,
                height,
                0xff0000,
                showColliders ? 0.25 : 0
            );
            rect.setOrigin(0, 0);
            this.physics.add.existing(rect, true);
            group.add(rect);
        };
        this.addStaticRect = addStaticRect;

        this.physics.add.collider(this.player, this.walls);
        this.physics.add.collider(this.player, this.obstacles);
        this.physics.add.collider(this.player.bullets, this.walls, (bullet) => {
            bullet.disableBody(true, true);
        });
        this.physics.add.collider(this.player.bullets, this.obstacles, (bullet) => {
            bullet.disableBody(true, true);
        });

        this.enemies = this.physics.add.group();
        this.enemyVariants = this.registry.get('enemyVariants') || [];
        this.enemyDefaultTexture = this.registry.get('enemyDefaultTexture') || 'enemy';
        this.enemyAnimMap = {
            walk: {},
            idle: {},
            idleBlink: {},
            attack: {},
            cast: {},
            taunt: {},
            hurt: {},
            dying: {}
        };
        this.enemyVariants.forEach((variant) => {
            const walkKey = `${variant}-walk`;
            const idleKey = `${variant}-idle`;
            const idleBlinkKey = `${variant}-idleBlink`;
            const attackKey = `${variant}-attack`;
            const castKey = `${variant}-cast`;
            const tauntKey = `${variant}-taunt`;
            const hurtKey = `${variant}-hurt`;
            const dyingKey = `${variant}-dying`;
            this.enemyAnimMap.walk[variant] = this.anims.exists(walkKey) ? walkKey : null;
            this.enemyAnimMap.idle[variant] = this.anims.exists(idleKey) ? idleKey : null;
            this.enemyAnimMap.idleBlink[variant] = this.anims.exists(idleBlinkKey) ? idleBlinkKey : null;
            this.enemyAnimMap.attack[variant] = this.anims.exists(attackKey) ? attackKey : null;
            this.enemyAnimMap.cast[variant] = this.anims.exists(castKey) ? castKey : null;
            this.enemyAnimMap.taunt[variant] = this.anims.exists(tauntKey) ? tauntKey : null;
            this.enemyAnimMap.hurt[variant] = this.anims.exists(hurtKey) ? hurtKey : null;
            this.enemyAnimMap.dying[variant] = this.anims.exists(dyingKey) ? dyingKey : null;
        });
        this.bossId = this.registry.get('bossId') || 'boss1';
        this.bossAnimMap = {
            idle: this.anims.exists(`${this.bossId}-idle`) ? `${this.bossId}-idle` : null,
            idleBlink: this.anims.exists(`${this.bossId}-idleBlink`) ? `${this.bossId}-idleBlink` : null,
            walk: this.anims.exists(`${this.bossId}-walk`) ? `${this.bossId}-walk` : null,
            run: this.anims.exists(`${this.bossId}-run`) ? `${this.bossId}-run` : null,
            jumpStart: this.anims.exists(`${this.bossId}-jumpStart`) ? `${this.bossId}-jumpStart` : null,
            jumpLoop: this.anims.exists(`${this.bossId}-jumpLoop`) ? `${this.bossId}-jumpLoop` : null,
            fall: this.anims.exists(`${this.bossId}-fall`) ? `${this.bossId}-fall` : null,
            slide: this.anims.exists(`${this.bossId}-slide`) ? `${this.bossId}-slide` : null,
            kick: this.anims.exists(`${this.bossId}-kick`) ? `${this.bossId}-kick` : null,
            slash: this.anims.exists(`${this.bossId}-slash`) ? `${this.bossId}-slash` : null,
            runSlash: this.anims.exists(`${this.bossId}-runSlash`) ? `${this.bossId}-runSlash` : null,
            throw: this.anims.exists(`${this.bossId}-throw`) ? `${this.bossId}-throw` : null,
            runThrow: this.anims.exists(`${this.bossId}-runThrow`) ? `${this.bossId}-runThrow` : null,
            throwAir: this.anims.exists(`${this.bossId}-throwAir`) ? `${this.bossId}-throwAir` : null,
            slashAir: this.anims.exists(`${this.bossId}-slashAir`) ? `${this.bossId}-slashAir` : null,
            cast: this.anims.exists(`${this.bossId}-cast`) ? `${this.bossId}-cast` : null,
            taunt: this.anims.exists(`${this.bossId}-taunt`) ? `${this.bossId}-taunt` : null,
            hurt: this.anims.exists(`${this.bossId}-hurt`) ? `${this.bossId}-hurt` : null,
            dying: this.anims.exists(`${this.bossId}-dying`) ? `${this.bossId}-dying` : null
        };
        this.physics.add.collider(this.enemies, this.walls);
        this.physics.add.collider(this.enemies, this.obstacles);
        // Evita vibraciÃ³n por choques constantes entre enemigos
        this.physics.add.overlap(this.player.bullets, this.enemies, this.onBulletHitEnemy, null, this);
        this.physics.add.overlap(this.player, this.enemies, this.onPlayerHitEnemy, null, this);

        this.doorSystem = new DoorSystem(eventBus);
        this.roomSequence = ['starter', 'easy', 'medium', 'boss'];
        this.currentRoomIndex = 0;
        this.clearedRooms = new Set();
        this.isTransitioning = false;
        this.doorCooldownUntil = 0;
        this.roomSpawnTimer = null;
        this.roomSpawnQueue = [];
        this.roomSpawnConfig = null;
        this.separationRadius = 90;
        this.separationStrength = 180;
        this.starterBossSpawned = false;
        this.starterBossDefeated = false;
        this.starterBossActive = false;

        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.loadRoomByIndex(0, 'left');
    }

    loadRoomByIndex(index, playerStartSide = 'left') {
        const roomId = this.roomSequence[index];
        const template = ROOM_TEMPLATES[roomId];
        if (!template) {
            console.error(`[SectorScene] Room template no encontrado: ${roomId}`);
            return;
        }

        this.roomScaleX = this.worldWidth / template.width;
        this.roomScaleY = this.worldHeight / template.height;

        this.isTransitioning = true;
        this.enemies.clear(true, true);
        this.player.bullets.clear(true, true);
        this.obstacles.clear(true, true);
        this.walls.clear(true, true);
        if (this.roomSpawnTimer) {
            this.roomSpawnTimer.remove(false);
            this.roomSpawnTimer = null;
        }
        this.roomSpawnQueue = [];
        this.roomSpawnConfig = null;

        const isCleared = this.clearedRooms.has(roomId);
        if (!isCleared && template.enemies.length > 0) {
            this.roomSpawnConfig = this.getRoomSpawnConfig(roomId, template);
            this.roomSpawnQueue = this.buildSpawnQueue(template, this.roomSpawnConfig.total);
            this.spawnRoomWave();
            this.roomSpawnTimer = this.time.addEvent({
                delay: this.roomSpawnConfig.delayMs,
                loop: true,
                callback: () => this.spawnRoomWave()
            });
        }

        this.buildRoomColliders(template);

        const scaledDoors = template.doors.map((door) => ({
            ...door,
            x: door.x * this.roomScaleX,
            y: door.y * this.roomScaleY
        }));
        this.doorSystem.initDoors(scaledDoors);
        this.doorSystem.getDoors().forEach((door) => {
            door.width *= this.roomScaleX;
            door.height *= this.roomScaleY;
        });
        if (this.enemies.countActive(true) > 0) {
            this.doorSystem.lockAllDoors();
        } else {
            this.doorSystem.unlockAllDoors();
        }

        if (playerStartSide === 'left') {
            this.player.x = 90 * this.roomScaleX;
            this.player.y = (template.height * 0.5) * this.roomScaleY;
        } else {
            this.player.x = (template.width - 90) * this.roomScaleX;
            this.player.y = (template.height * 0.5) * this.roomScaleY;
        }

        this.player.x = Phaser.Math.Clamp(this.player.x, 60, this.worldWidth - 60);
        this.player.y = Phaser.Math.Clamp(this.player.y, 60, this.worldHeight - 60);

        this.currentRoomIndex = index;
        this.doorCooldownUntil = this.time.now + 300;
        this.isTransitioning = false;
    }

    getRoomSpawnConfig(roomId, template) {
        if (template.enemies.some((enemy) => enemy.type === 'boss')) {
            return { total: 1, perWave: 1, maxAlive: 1, delayMs: 1200 };
        }
        const defaults = {
            starter: { total: 12, perWave: 3, maxAlive: 6, delayMs: 1200 },
            easy: { total: 16, perWave: 4, maxAlive: 8, delayMs: 1100 },
            medium: { total: 20, perWave: 4, maxAlive: 10, delayMs: 1000 },
            boss: { total: 1, perWave: 1, maxAlive: 1, delayMs: 1200 }
        };
        return defaults[roomId] ?? { total: template.enemies.length * 3, perWave: 3, maxAlive: 8, delayMs: 1100 };
    }

    buildSpawnQueue(template, totalCount) {
        const bases = template.enemies.length > 0
            ? template.enemies
            : [
                { x: template.width * 0.5, y: template.height * 0.5, type: 'basic', hp: 30 }
            ];
        const queue = [];
        for (let i = 0; i < totalCount; i += 1) {
            const base = Phaser.Utils.Array.GetRandom(bases);
            queue.push({
                x: base.x,
                y: base.y,
                type: base.type ?? 'basic',
                hp: base.hp ?? 30
            });
        }
        return queue;
    }

    spawnRoomWave() {
        if (!this.roomSpawnConfig || this.roomSpawnQueue.length === 0) return;
        const maxAlive = this.roomSpawnConfig.maxAlive;
        const currentAlive = this.enemies.countActive(true);
        if (currentAlive >= maxAlive) return;
        const availableSlots = Math.max(maxAlive - currentAlive, 0);
        const toSpawn = Math.min(this.roomSpawnConfig.perWave, availableSlots, this.roomSpawnQueue.length);
        const spawnPoints = this.getSpawnPoints();
        const usedPoints = new Set();
        for (let i = 0; i < toSpawn; i += 1) {
            const enemyData = this.roomSpawnQueue.shift();
            const point = this.pickSpawnPoint(spawnPoints, usedPoints);
            const jitterX = Phaser.Math.Between(-40, 40);
            const jitterY = Phaser.Math.Between(-40, 40);
            this.spawnEnemy(
                (point.x + jitterX) * this.roomScaleX,
                (point.y + jitterY) * this.roomScaleY,
                enemyData
            );
        }
    }

    maybeSpawnStarterBoss() {
        const roomId = this.roomSequence[this.currentRoomIndex];
        if (roomId !== 'starter') return false;
        if (this.starterBossSpawned || this.starterBossDefeated) return false;
        if (this.roomSpawnQueue.length > 0) return false;
        if (this.enemies.countActive(true) > 0) return false;
        this.spawnStarterBoss();
        return true;
    }

    spawnStarterBoss() {
        this.starterBossSpawned = true;
        this.starterBossActive = true;
        if (this.roomSpawnTimer) {
            this.roomSpawnTimer.remove(false);
            this.roomSpawnTimer = null;
        }
        const template = ROOM_TEMPLATES[this.roomSequence[this.currentRoomIndex]];
        const spawnX = (template.width * 0.65) * this.roomScaleX;
        const spawnY = (template.height * 0.5) * this.roomScaleY;
        this.spawnBoss(spawnX, spawnY);
        this.doorSystem.lockAllDoors();
    }

    getSpawnPoints() {
        const template = ROOM_TEMPLATES[this.roomSequence[this.currentRoomIndex]];
        const points = template.enemies.map((enemy) => ({ x: enemy.x, y: enemy.y }));
        const extra = [
            { x: 200, y: 150 },
            { x: 600, y: 150 },
            { x: 200, y: 450 },
            { x: 600, y: 450 },
            { x: 400, y: 300 },
            { x: 120, y: 320 },
            { x: 680, y: 320 }
        ];
        return points.concat(extra);
    }

    pickSpawnPoint(points, usedPoints) {
        const minDist = 90;
        let best = null;
        for (let attempt = 0; attempt < 12; attempt += 1) {
            const idx = Phaser.Math.Between(0, points.length - 1);
            if (usedPoints.has(idx)) continue;
            const point = points[idx];
            const ok = this.enemies.getChildren().every((enemy) => {
                if (!enemy.active) return true;
                const dx = enemy.x - point.x * this.roomScaleX;
                const dy = enemy.y - point.y * this.roomScaleY;
                return Math.hypot(dx, dy) > minDist * this.roomScaleX;
            });
            if (ok) {
                usedPoints.add(idx);
                best = point;
                break;
            }
        }
        if (best) return best;
        return Phaser.Utils.Array.GetRandom(points);
    }

    spawnEnemy(x, y, enemyData = {}) {
        const variant = enemyData.variant || Phaser.Utils.Array.GetRandom(this.enemyVariants);
        const textureKey = variant ? `${variant}-walk-000` : this.enemyDefaultTexture;
        const enemy = this.physics.add.sprite(x, y, textureKey);
        enemy.setOrigin(0.5, 1);
        enemy.setData('variant', variant || 'default');
        enemy.setData('state', 'walk');
        enemy.setData('nextEmoteAt', this.time.now + Phaser.Math.Between(1500, 3500));
        enemy.setData('nextIdleBlinkAt', this.time.now + Phaser.Math.Between(1200, 3200));
        enemy.setData('nextAttackAt', 0);
        enemy.setData('targetOffset', {
            x: Phaser.Math.Between(-90, 90),
            y: Phaser.Math.Between(-90, 90)
        });
        const isBoss = enemyData.type === 'boss';
        const isFast = enemyData.type === 'fast';
        const scale = isBoss ? 0.32 : 0.25;
        enemy.setScale(scale);
        enemy.setData('hp', enemyData.hp ?? 30);
        enemy.setData('speed', isBoss ? 90 : isFast ? 200 : Phaser.Math.Between(150, 190));
        enemy.setData('lastHit', 0);
        enemy.setData('isHurting', false);
        enemy.setData('isDying', false);
        enemy.setDepth(9);
        const bodyWidth = enemy.displayWidth * 0.6;
        const bodyHeight = enemy.displayHeight * 0.6;
        enemy.body.setSize(bodyWidth, bodyHeight);
        enemy.body.setOffset(
            (enemy.displayWidth - bodyWidth) / 2,
            enemy.displayHeight - bodyHeight
        );
        const defaultAnim = variant ? this.enemyAnimMap.walk[variant] : null;
        if (defaultAnim) {
            enemy.anims.play(defaultAnim, true);
        }
        this.enemies.add(enemy);

        if (Phaser.Math.Between(0, 100) < 15) {
            this.playEnemyAction(enemy, 'taunt');
        }
    }

    spawnBoss(x, y) {
        const textureKey = `${this.bossId}-idle-000`;
        const boss = this.physics.add.sprite(x, y, textureKey);
        boss.setOrigin(0.5, 1);
        boss.setData('isBoss', true);
        boss.setData('state', 'idle');
        boss.setData('variant', this.bossId);
        boss.setData('hp', 900);
        boss.setData('speed', 130);
        boss.setData('isDying', false);
        boss.setData('nextActionAt', this.time.now + 800);
        boss.setData('nextEmoteAt', this.time.now + 1500);
        boss.setData('nextJumpAt', this.time.now + 3000);
        boss.setScale(0.36);
        boss.setDepth(10);
        const bodyWidth = boss.displayWidth * 0.6;
        const bodyHeight = boss.displayHeight * 0.6;
        boss.body.setSize(bodyWidth, bodyHeight);
        boss.body.setOffset(
            (boss.displayWidth - bodyWidth) / 2,
            boss.displayHeight - bodyHeight
        );
        if (this.bossAnimMap.idle) {
            boss.anims.play(this.bossAnimMap.idle, true);
        }
        this.enemies.add(boss);
    }

    onBulletHitEnemy(bullet, enemy) {
        bullet.disableBody(true, true);
        if (enemy.getData('isDying')) return;
        const hp = enemy.getData('hp') - this.player.stats.damage;
        enemy.setData('hp', hp);
        if (hp <= 0) {
            if (enemy.getData('isBoss')) {
                this.playBossDeath(enemy);
            } else {
                this.playEnemyDeath(enemy);
            }
            return;
        }
        if (enemy.getData('isBoss')) {
            this.playBossHurt(enemy);
        } else {
            this.playEnemyHurt(enemy);
        }
    }

    onEnemyKilled() {
        if (this.enemies.countActive(true) > 0) return;
        if (this.roomSpawnQueue.length > 0) return;
        if (this.maybeSpawnStarterBoss()) return;
        this.onRoomCleared();
    }

    onRoomCleared() {
        const currentRoomId = this.roomSequence[this.currentRoomIndex];
        this.clearedRooms.add(currentRoomId);
        if (currentRoomId === 'boss') {
            this.completeSector();
            return;
        }
        if (this.roomSpawnTimer) {
            this.roomSpawnTimer.remove(false);
            this.roomSpawnTimer = null;
        }
        this.doorSystem.unlockForwardDoors();
    }

    completeSector() {
        if (this.exitTriggered) return;
        this.handleExit();
    }

    onPlayerHitEnemy(player, enemy) {
        const now = this.time.now;
        const lastHit = enemy.getData('lastHit') || 0;
        if (now - lastHit < 400) return;
        enemy.setData('lastHit', now);
        if (enemy.getData('isBoss')) {
            const nextAttackAt = enemy.getData('nextAttackAt') || 0;
            if (now >= nextAttackAt) {
                const melee = ['kick', 'slash', 'runSlash'];
                this.playBossAction(enemy, Phaser.Utils.Array.GetRandom(melee));
                enemy.setData('nextAttackAt', now + 700);
            }
            player.receiveHit(20);
            return;
        }
        const nextAttackAt = enemy.getData('nextAttackAt') || 0;
        if (now >= nextAttackAt) {
            this.playEnemyAction(enemy, 'attack');
            enemy.setData('nextAttackAt', now + 700);
        }
        player.receiveHit(10);
    }

    handleExit() {
        if (this.exitTriggered) return;
        this.exitTriggered = true;
        this.player.setVelocity(0, 0);
        this.tweens.add({
            targets: this.player,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                eventBus.emit('sector:complete');
                sceneManager.go(this, 'HubScene');
            }
        });
    }

    update(time, delta) {
        this.player.update();
        this.updateEnemies(delta);
        this.doorSystem.update(delta / 1000);
        this.checkDoorEntry();
    }

    updateEnemies() {
        const now = this.time.now;
        this.enemies.getChildren().forEach((enemy) => {
            if (!enemy.active) return;
            if (enemy.getData('isBoss')) {
                this.updateBoss(enemy, now);
                return;
            }
            if (this.isEnemyBusy(enemy)) {
                enemy.setVelocity(0, 0);
                return;
            }
            this.maybeTriggerEnemyEmote(enemy, now);
            this.moveEnemyTowardPlayer(enemy);
            this.updateEnemyAnim(enemy, now);
        });
    }

    buildRoomColliders(template) {
        if (!template) return;

        const scaleX = this.roomScaleX;
        const scaleY = this.roomScaleY;

        (template.walls || []).forEach((rect) => {
            this.addStaticRect(
                this.walls,
                rect.x * scaleX,
                rect.y * scaleY,
                rect.width * scaleX,
                rect.height * scaleY
            );
        });

        (template.obstacles || []).forEach((rect) => {
            this.addStaticRect(
                this.obstacles,
                rect.x * scaleX,
                rect.y * scaleY,
                rect.width * scaleX,
                rect.height * scaleY
            );
        });
    }

    moveEnemyTowardPlayer(enemy) {
        const speed = enemy.getData('speed');
        const distToPlayer = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        if (distToPlayer < 35) {
            enemy.setVelocity(0, 0);
            return;
        }

        const now = this.time.now;
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

        const targetX = this.player.x + offset.x;
        const targetY = this.player.y + offset.y;
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
                ? this.separationStrength * 0.3
                : this.separationStrength;
            this.enemies.getChildren().forEach((other) => {
                if (!other.active || other === enemy) return;
                const dx = enemy.x - other.x;
                const dy = enemy.y - other.y;
                const dist = Math.hypot(dx, dy);
                if (dist > 0 && dist < this.separationRadius) {
                    const force = ((this.separationRadius - dist) / this.separationRadius) * separationStrength;
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

        // El offset se actualiza de forma controlada arriba.
    }

    updateBoss(boss, now) {
        if (boss.getData('isDying')) {
            boss.setVelocity(0, 0);
            return;
        }
        if (this.isBossBusy(boss)) {
            boss.setVelocity(0, 0);
            return;
        }

        const dist = Phaser.Math.Distance.Between(boss.x, boss.y, this.player.x, this.player.y);
        const nextActionAt = boss.getData('nextActionAt') || 0;
        const nextJumpAt = boss.getData('nextJumpAt') || 0;
        const nextHitAt = boss.getData('nextHitAt') || 0;

        if (dist < 140 && now >= nextHitAt) {
            const melee = this.pickBossAction(['kick', 'slash', 'runSlash']);
            if (melee) {
                this.playBossAction(boss, melee);
            }
            boss.setData('nextHitAt', now + 650);
            this.player.receiveHit(20);
        }

        if (dist > 320 && now >= nextJumpAt) {
            this.startBossJump(boss, now);
            return;
        }

        if (now >= nextActionAt) {
            if (dist < 140) {
                const melee = this.pickBossAction(['kick', 'slash', 'runSlash', 'slide']);
                if (melee) {
                    this.playBossAction(boss, melee);
                }
                boss.setData('nextActionAt', now + Phaser.Math.Between(700, 1100));
            } else if (dist < 260) {
                const mid = this.pickBossAction(['throw', 'runThrow', 'slash']);
                if (mid) {
                    this.playBossAction(boss, mid);
                }
                boss.setData('nextActionAt', now + Phaser.Math.Between(900, 1300));
            } else if (dist >= 260) {
                const ranged = this.pickBossAction(['cast', 'taunt', 'runThrow', 'throw']);
                if (ranged) {
                    this.playBossAction(boss, ranged);
                }
                boss.setData('nextActionAt', now + Phaser.Math.Between(1200, 1600));
            }
        }

        const speed = boss.getData('speed');
        if (dist > 220 && this.bossAnimMap.run) {
            boss.setVelocity(
                (this.player.x - boss.x) * 0.004 * speed,
                (this.player.y - boss.y) * 0.004 * speed
            );
            if (boss.body.velocity.x !== 0) {
                boss.setFlipX(boss.body.velocity.x < 0);
            }
            this.playBossLoop(boss, 'run');
            return;
        }

        if (dist > 120) {
            this.moveBossTowardPlayer(boss);
            this.playBossLoop(boss, 'walk');
        } else {
            boss.setVelocity(0, 0);
            this.playBossIdle(boss, now);
        }
    }

    moveBossTowardPlayer(boss) {
        const speed = boss.getData('speed');
        this.physics.moveToObject(boss, this.player, speed);
        if (boss.body.velocity.x !== 0) {
            boss.setFlipX(boss.body.velocity.x < 0);
        }
    }

    playBossIdle(boss, now) {
        if (this.bossAnimMap.idleBlink) {
            const nextEmoteAt = boss.getData('nextEmoteAt') || 0;
            if (now >= nextEmoteAt) {
                boss.setData('nextEmoteAt', now + Phaser.Math.Between(2000, 4000));
                this.playBossAction(boss, 'idleBlink');
                return;
            }
        }
        this.playBossLoop(boss, 'idle');
    }

    playBossLoop(boss, action) {
        const animKey = this.bossAnimMap[action];
        if (!animKey) return;
        if (boss.anims.currentAnim?.key === animKey) return;
        boss.setData('state', action);
        boss.anims.play(animKey, true);
    }

    pickBossAction(options) {
        const available = options.filter((action) => this.bossAnimMap[action]);
        if (available.length === 0) return null;
        return Phaser.Utils.Array.GetRandom(available);
    }

    startBossJump(boss, now) {
        boss.setData('nextJumpAt', now + Phaser.Math.Between(4500, 6500));
        const started = this.playBossAction(boss, 'jumpStart', {
            onComplete: () => {
                this.playBossLoop(boss, 'jumpLoop');
                this.time.delayedCall(400, () => {
                    if (!boss.active) return;
                    const airAction = Phaser.Math.Between(0, 1) === 0 ? 'slashAir' : 'throwAir';
                    this.playBossAction(boss, airAction, {
                        force: true,
                        onComplete: () => this.playBossAction(boss, 'fall', { force: true })
                    });
                });
            }
        });
        return started;
    }

    isBossBusy(boss) {
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

    isEnemyBusy(enemy) {
        const state = enemy.getData('state');
        return state === 'hurt' ||
            state === 'attack' ||
            state === 'cast' ||
            state === 'taunt' ||
            state === 'idleBlink' ||
            state === 'dying';
    }

    maybeTriggerEnemyEmote(enemy, now) {
        const variant = enemy.getData('variant');
        if (!variant || variant === 'default') return;
        const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        const nextEmoteAt = enemy.getData('nextEmoteAt') || 0;
        if (now < nextEmoteAt) return;
        if (distance < 260) return;

        const roll = Phaser.Math.Between(0, 100);
        if (roll < 65) {
            this.playEnemyAction(enemy, 'cast');
        } else {
            this.playEnemyAction(enemy, 'taunt');
        }
        enemy.setData('nextEmoteAt', now + Phaser.Math.Between(3500, 7000));
    }

    updateEnemyAnim(enemy, now) {
        if (this.isEnemyBusy(enemy)) return;
        const { x: vx, y: vy } = enemy.body.velocity;
        const speed = Math.abs(vx) + Math.abs(vy);
        const variant = enemy.getData('variant');
        const walkKey = variant && variant !== 'default' ? this.enemyAnimMap.walk[variant] : null;
        const idleKey = variant && variant !== 'default' ? this.enemyAnimMap.idle[variant] : null;
        const idleBlinkKey = variant && variant !== 'default' ? this.enemyAnimMap.idleBlink[variant] : null;

        if (vx !== 0) {
            enemy.setFlipX(vx < 0);
        }

        if (speed <= 1 && idleBlinkKey) {
            const nextBlinkAt = enemy.getData('nextIdleBlinkAt') || 0;
            if (now >= nextBlinkAt) {
                enemy.setData('nextIdleBlinkAt', now + Phaser.Math.Between(2000, 5000));
                this.playEnemyAction(enemy, 'idleBlink');
                return;
            }
        }

        const nextAnim = speed > 1 ? walkKey : idleKey || walkKey;
        if (!nextAnim) return;
        if (enemy.anims.currentAnim?.key === nextAnim) return;
        enemy.anims.play(nextAnim, true);
    }

    playEnemyHurt(enemy) {
        this.playEnemyAction(enemy, 'hurt');
    }

    playEnemyDeath(enemy) {
        if (enemy.getData('isDying')) return;
        enemy.setData('isDying', true);
        this.playEnemyAction(enemy, 'dying', {
            onComplete: () => {
                if (!enemy.active) return;
                enemy.destroy();
                this.onEnemyKilled();
            }
        });
    }

    playEnemyAction(enemy, action, opts = {}) {
        const variant = enemy.getData('variant');
        const animKey = variant && variant !== 'default' ? this.enemyAnimMap[action]?.[variant] : null;
        if (!animKey) return false;
        if (this.isEnemyBusy(enemy) && action !== 'dying' && action !== 'hurt') return false;

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

    playBossHurt(boss) {
        this.playBossAction(boss, 'hurt');
    }

    playBossDeath(boss) {
        if (boss.getData('isDying')) return;
        boss.setData('isDying', true);
        this.playBossAction(boss, 'dying', {
            onComplete: () => {
                if (!boss.active) return;
                boss.destroy();
                this.starterBossDefeated = true;
                this.starterBossActive = false;
                this.onEnemyKilled();
            }
        });
    }

    playBossAction(boss, action, opts = {}) {
        const animKey = this.bossAnimMap[action];
        if (!animKey) return false;
        if (this.isBossBusy(boss) && !opts.force && action !== 'dying' && action !== 'hurt') return false;

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

    checkDoorEntry() {
        if (this.isTransitioning) return;
        if (this.time.now < this.doorCooldownUntil) return;

        const playerRect = {
            x: this.player.body.x,
            y: this.player.body.y,
            width: this.player.body.width,
            height: this.player.body.height
        };
        const door = this.doorSystem.checkDoorCollision(playerRect);
        if (!door) return;
        this.handleDoorEntry(door);
    }

    handleDoorEntry(door) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        if (door.leadsTo === 'next') {
            this.nextRoom();
            return;
        }
        if (door.leadsTo === 'prev') {
            this.previousRoom();
            return;
        }
        this.isTransitioning = false;
    }

    nextRoom() {
        const currentRoomId = this.roomSequence[this.currentRoomIndex];
        this.clearedRooms.add(currentRoomId);
        this.currentRoomIndex += 1;
        if (this.currentRoomIndex >= this.roomSequence.length) {
            this.completeSector();
            return;
        }
        this.loadRoomByIndex(this.currentRoomIndex, 'left');
    }

    previousRoom() {
        if (this.currentRoomIndex <= 0) {
            this.isTransitioning = false;
            return;
        }
        this.currentRoomIndex -= 1;
        this.loadRoomByIndex(this.currentRoomIndex, 'right');
    }
}
