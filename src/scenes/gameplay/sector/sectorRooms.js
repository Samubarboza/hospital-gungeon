import { eventBus } from '../../../core/EventBus.js';
import { sceneManager } from '../../../core/SceneManager.js';
import { ROOM_TEMPLATES } from '../../../systems/rooms/RoomTemplates.js';
import { DoorSystem } from '../../../systems/rooms/DoorSystem.js';
import { getDifficultyConfig } from '../../../core/DifficultyConfig.js';

export function createRoomSystem(scene, enemySystem) {
    const roomSystem = {
        roomSequence: ['starter', 'easy', 'medium', 'boss'],
        currentRoomIndex: 0,
        clearedRooms: new Set(),
        isTransitioning: false,
        doorCooldownUntil: 0,
        roomSpawnTimer: null,
        roomSpawnQueue: [],
        roomSpawnConfig: null,
        starterBossSpawned: false,
        starterBossDefeated: false
    };

    roomSystem.doorSystem = new DoorSystem(eventBus);
    scene.doorSystem = roomSystem.doorSystem;

    roomSystem.loadRoomByIndex = (index, playerStartSide = 'left') => {
        const roomId = roomSystem.roomSequence[index];
        const template = ROOM_TEMPLATES[roomId];
        if (!template) {
            console.error(`[SectorScene] Room template no encontrado: ${roomId}`);
            return;
        }

        scene.roomScaleX = scene.worldWidth / template.width;
        scene.roomScaleY = scene.worldHeight / template.height;

        roomSystem.isTransitioning = true;
        if (scene.enemyFactory) {
            scene.enemyFactory.destroyAll();
        }
        scene.enemies.clear(true, true);
        scene.player.bullets.clear(true, true);
        scene.obstacles.clear(true, true);
        scene.walls.clear(true, true);
        if (roomSystem.roomSpawnTimer) {
            roomSystem.roomSpawnTimer.remove(false);
            roomSystem.roomSpawnTimer = null;
        }
        roomSystem.roomSpawnQueue = [];
        roomSystem.roomSpawnConfig = null;

        const isCleared = roomSystem.clearedRooms.has(roomId);
        if (!isCleared && template.enemies.length > 0) {
            roomSystem.roomSpawnConfig = getRoomSpawnConfig(roomId, template);
            roomSystem.roomSpawnQueue = buildSpawnQueue(template, roomSystem.roomSpawnConfig.total);
            spawnRoomWave();
            roomSystem.roomSpawnTimer = scene.time.addEvent({
                delay: roomSystem.roomSpawnConfig.delayMs,
                loop: true,
                callback: () => spawnRoomWave()
            });
        }

        buildRoomColliders(template);

        const scaledDoors = template.doors.map((door) => ({
            ...door,
            x: door.x * scene.roomScaleX,
            y: door.y * scene.roomScaleY
        }));
        roomSystem.doorSystem.initDoors(scaledDoors);
        roomSystem.doorSystem.getDoors().forEach((door) => {
            door.width *= scene.roomScaleX;
            door.height *= scene.roomScaleY;
        });
        if (scene.enemies.countActive(true) > 0) {
            roomSystem.doorSystem.lockAllDoors();
        } else {
            roomSystem.doorSystem.unlockAllDoors();
        }

        if (playerStartSide === 'left') {
            scene.player.x = 90 * scene.roomScaleX;
            scene.player.y = (template.height * 0.5) * scene.roomScaleY;
        } else {
            scene.player.x = (template.width - 90) * scene.roomScaleX;
            scene.player.y = (template.height * 0.5) * scene.roomScaleY;
        }

        scene.player.x = Phaser.Math.Clamp(scene.player.x, 60, scene.worldWidth - 60);
        scene.player.y = Phaser.Math.Clamp(scene.player.y, 60, scene.worldHeight - 60);

        roomSystem.currentRoomIndex = index;
        scene.currentRoomIndex = index;
        roomSystem.doorCooldownUntil = scene.time.now + 300;
        roomSystem.isTransitioning = false;
    };

    function getRoomSpawnConfig(roomId, template) {
        if (template.enemies.some((enemy) => enemy.type === 'boss')) {
            return { total: 1, perWave: 1, maxAlive: 1, delayMs: 1200 };
        }
        const defaults = {
            starter: { total: 12, perWave: 3, maxAlive: 6, delayMs: 1200 },
            easy: { total: 16, perWave: 4, maxAlive: 8, delayMs: 1100 },
            medium: { total: 20, perWave: 4, maxAlive: 10, delayMs: 1000 },
            boss: { total: 1, perWave: 1, maxAlive: 1, delayMs: 1200 }
        };
        const baseConfig = defaults[roomId] ?? { total: template.enemies.length * 3, perWave: 3, maxAlive: 8, delayMs: 1100 };
        const difficulty = getDifficultyConfig(scene);
        const spawnTuning = difficulty.spawn;
        return {
            total: Math.max(1, Math.round(baseConfig.total * spawnTuning.maxAliveMultiplier)),
            perWave: Math.max(1, Math.round(baseConfig.perWave * spawnTuning.perWaveMultiplier)),
            maxAlive: Math.max(1, Math.round(baseConfig.maxAlive * spawnTuning.maxAliveMultiplier)),
            delayMs: Math.max(200, Math.round(baseConfig.delayMs * spawnTuning.delayMultiplier))
        };
    }

    function buildSpawnQueue(template, totalCount) {
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

    function spawnRoomWave() {
        if (!roomSystem.roomSpawnConfig || roomSystem.roomSpawnQueue.length === 0) return;
        const maxAlive = roomSystem.roomSpawnConfig.maxAlive;
        const currentAlive = scene.enemies.countActive(true);
        if (currentAlive >= maxAlive) return;
        const availableSlots = Math.max(maxAlive - currentAlive, 0);
        const toSpawn = Math.min(roomSystem.roomSpawnConfig.perWave, availableSlots, roomSystem.roomSpawnQueue.length);
        const spawnPoints = getSpawnPoints();
        const usedPoints = new Set();
        for (let i = 0; i < toSpawn; i += 1) {
            const enemyData = roomSystem.roomSpawnQueue.shift();
            const point = pickSpawnPoint(spawnPoints, usedPoints);
            const jitterX = Phaser.Math.Between(-40, 40);
            const jitterY = Phaser.Math.Between(-40, 40);
            enemySystem.spawnEnemy(
                (point.x + jitterX) * scene.roomScaleX,
                (point.y + jitterY) * scene.roomScaleY,
                enemyData
            );
        }
    }

    function maybeSpawnStarterBoss() {
        const roomId = roomSystem.roomSequence[roomSystem.currentRoomIndex];
        if (roomId !== 'starter') return false;
        if (roomSystem.starterBossSpawned || roomSystem.starterBossDefeated) return false;
        if (roomSystem.roomSpawnQueue.length > 0) return false;
        if (scene.enemies.countActive(true) > 0) return false;
        spawnStarterBoss();
        return true;
    }

    function spawnStarterBoss() {
        roomSystem.starterBossSpawned = true;
        if (roomSystem.roomSpawnTimer) {
            roomSystem.roomSpawnTimer.remove(false);
            roomSystem.roomSpawnTimer = null;
        }
        const template = ROOM_TEMPLATES[roomSystem.roomSequence[roomSystem.currentRoomIndex]];
        const spawnX = (template.width * 0.65) * scene.roomScaleX;
        const spawnY = (template.height * 0.5) * scene.roomScaleY;
        enemySystem.spawnBoss(spawnX, spawnY);
        roomSystem.doorSystem.lockAllDoors();
    }

    function getSpawnPoints() {
        const template = ROOM_TEMPLATES[roomSystem.roomSequence[roomSystem.currentRoomIndex]];
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

    function pickSpawnPoint(points, usedPoints) {
        const minDist = 90;
        let best = null;
        for (let attempt = 0; attempt < 12; attempt += 1) {
            const idx = Phaser.Math.Between(0, points.length - 1);
            if (usedPoints.has(idx)) continue;
            const point = points[idx];
            const ok = scene.enemies.getChildren().every((enemy) => {
                if (!enemy.active) return true;
                const dx = enemy.x - point.x * scene.roomScaleX;
                const dy = enemy.y - point.y * scene.roomScaleY;
                return Math.hypot(dx, dy) > minDist * scene.roomScaleX;
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

    function buildRoomColliders(template) {
        if (!template) return;

        const scaleX = scene.roomScaleX;
        const scaleY = scene.roomScaleY;

        (template.walls || []).forEach((rect) => {
            scene.addStaticRect(
                scene.walls,
                rect.x * scaleX,
                rect.y * scaleY,
                rect.width * scaleX,
                rect.height * scaleY
            );
        });

        (template.obstacles || []).forEach((rect) => {
            scene.addStaticRect(
                scene.obstacles,
                rect.x * scaleX,
                rect.y * scaleY,
                rect.width * scaleX,
                rect.height * scaleY
            );
        });
    }

    roomSystem.onEnemyKilled = (enemy) => {
        if (enemy?.getData?.('isBoss')) {
            roomSystem.starterBossDefeated = true;
        }
        if (scene.enemies.countActive(true) > 0) return;
        if (roomSystem.roomSpawnQueue.length > 0) return;
        if (maybeSpawnStarterBoss()) return;
        onRoomCleared();
    };

    function onRoomCleared() {
        const currentRoomId = roomSystem.roomSequence[roomSystem.currentRoomIndex];
        roomSystem.clearedRooms.add(currentRoomId);
        if (currentRoomId === 'boss') {
            completeSector();
            return;
        }
        if (roomSystem.roomSpawnTimer) {
            roomSystem.roomSpawnTimer.remove(false);
            roomSystem.roomSpawnTimer = null;
        }
        roomSystem.doorSystem.unlockForwardDoors();
    }

    function completeSector() {
        if (scene.exitTriggered) return;
        handleExit();
    }

    function handleExit() {
        if (scene.exitTriggered) return;
        scene.exitTriggered = true;
        scene.player.setVelocity(0, 0);
        scene.tweens.add({
            targets: scene.player,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                eventBus.emit('sector:complete');
                sceneManager.go(scene, 'HubScene');
            }
        });
    }

    roomSystem.update = (deltaMs) => {
        roomSystem.doorSystem.update(deltaMs / 1000);
        checkDoorEntry();
    };

    function checkDoorEntry() {
        if (roomSystem.isTransitioning) return;
        if (scene.time.now < roomSystem.doorCooldownUntil) return;

        const playerRect = {
            x: scene.player.body.x,
            y: scene.player.body.y,
            width: scene.player.body.width,
            height: scene.player.body.height
        };
        const door = roomSystem.doorSystem.checkDoorCollision(playerRect);
        if (!door) return;
        handleDoorEntry(door);
    }

    function handleDoorEntry(door) {
        if (roomSystem.isTransitioning) return;
        roomSystem.isTransitioning = true;
        if (door.leadsTo === 'next') {
            nextRoom();
            return;
        }
        if (door.leadsTo === 'prev') {
            previousRoom();
            return;
        }
        roomSystem.isTransitioning = false;
    }

    function nextRoom() {
        const currentRoomId = roomSystem.roomSequence[roomSystem.currentRoomIndex];
        roomSystem.clearedRooms.add(currentRoomId);
        roomSystem.currentRoomIndex += 1;
        if (roomSystem.currentRoomIndex >= roomSystem.roomSequence.length) {
            completeSector();
            return;
        }
        roomSystem.loadRoomByIndex(roomSystem.currentRoomIndex, 'left');
    }

    function previousRoom() {
        if (roomSystem.currentRoomIndex <= 0) {
            roomSystem.isTransitioning = false;
            return;
        }
        roomSystem.currentRoomIndex -= 1;
        roomSystem.loadRoomByIndex(roomSystem.currentRoomIndex, 'right');
    }

    roomSystem.destroy = () => {
        if (roomSystem.roomSpawnTimer) {
            roomSystem.roomSpawnTimer.remove(false);
            roomSystem.roomSpawnTimer = null;
        }
        roomSystem.doorSystem.clear();
    };

    return roomSystem;
}

