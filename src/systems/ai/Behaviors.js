/**
 * AI helper utilities and behaviors.
 */

export function distanceBetween(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export function angleBetween(obj1, obj2) {
    return Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x);
}

export function moveTowards(sprite, target, speed) {
    const angle = angleBetween(sprite, target);
    sprite.setVelocity(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
    );
}

export function moveAway(sprite, target, speed) {
    const angle = angleBetween(sprite, target);
    sprite.setVelocity(
        -Math.cos(angle) * speed,
        -Math.sin(angle) * speed
    );
}

export function stopMovement(sprite) {
    sprite.setVelocity(0, 0);
}

export function hasLineOfSight(scene, enemy, target, maxDistance = 500) {
    const distance = distanceBetween(enemy, target);
    if (distance > maxDistance) return false;
    return true;
}

export function flipTowardsTarget(sprite, target) {
    if (target.x < sprite.x) {
        sprite.setFlipX(true);
    } else {
        sprite.setFlipX(false);
    }
}

export function maintainDistance(sprite, target, optimalDistance, speed, tolerance = 50) {
    const distance = distanceBetween(sprite, target);

    if (distance > optimalDistance + tolerance) {
        moveTowards(sprite, target, speed);
    } else if (distance < optimalDistance - tolerance) {
        moveAway(sprite, target, speed);
    } else {
        stopMovement(sprite);
    }
}

export function canAttack(enemy, lastAttackTime, attackCooldown) {
    const currentTime = enemy.scene.time.now;
    return (currentTime - lastAttackTime) >= attackCooldown;
}

export function shootProjectile(scene, enemy, target, bulletSpeed = 300, bulletKey = 'bullet') {
    const angle = angleBetween(enemy, target);

    const bullet = scene.physics.add.sprite(enemy.x, enemy.y, bulletKey);
    bullet.setScale(0.5);
    bullet.body.setAllowGravity(false);
    bullet.setVelocity(
        Math.cos(angle) * bulletSpeed,
        Math.sin(angle) * bulletSpeed
    );

    scene.time.delayedCall(3000, () => {
        if (bullet && bullet.active) {
            bullet.destroy();
        }
    });

    return bullet;
}

export function isStuck(sprite, lastPosition, threshold = 5) {
    if (!lastPosition) return false;
    const distance = distanceBetween(sprite, lastPosition);
    return distance < threshold;
}

export function wander(sprite, speed, changeDirectionChance = 0.02) {
    if (Math.random() < changeDirectionChance) {
        const angle = Math.random() * Math.PI * 2;
        sprite.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
    }
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function rectsOverlap(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

// Grid-based A* pathfinding.
export class AStarPathfinding {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.cellSize = options.cellSize ?? 32;
        this.clearance = options.clearance ?? 6;
        this.maxIterations = options.maxIterations ?? 8000;

        this.grid = null;
        this.cols = 0;
        this.rows = 0;
        this.worldWidth = 0;
        this.worldHeight = 0;
        this.lastGridKey = null;
    }

    findPath(start, end, endY, endX) {
        const normalized = this.normalizePoints(start, end, endY, endX);
        if (!normalized) return [];
        const { startPos, endPos } = normalized;

        this.ensureGrid();
        if (!this.grid) return [];

        const startCell = this.worldToCell(startPos.x, startPos.y);
        const endCell = this.worldToCell(endPos.x, endPos.y);
        const startNode = this.findNearestWalkable(startCell);
        const endNode = this.findNearestWalkable(endCell);
        if (!startNode || !endNode) return [];

        if (startNode.col === endNode.col && startNode.row === endNode.row) {
            return [{ x: endPos.x, y: endPos.y }];
        }

        const total = this.cols * this.rows;
        const gScore = new Float32Array(total);
        const fScore = new Float32Array(total);
        const cameFrom = new Int32Array(total);
        gScore.fill(Infinity);
        fScore.fill(Infinity);
        cameFrom.fill(-1);

        const startIdx = this.toIndex(startNode.col, startNode.row);
        const endIdx = this.toIndex(endNode.col, endNode.row);

        const open = [];
        const inOpen = new Uint8Array(total);
        const closed = new Uint8Array(total);

        gScore[startIdx] = 0;
        fScore[startIdx] = this.heuristic(startNode, endNode);
        open.push(startIdx);
        inOpen[startIdx] = 1;

        let found = false;
        let closestIdx = startIdx;
        let closestH = this.heuristic(startNode, endNode);
        let iterations = 0;
        const maxIterations = Math.max(this.maxIterations, total * 4);

        while (open.length > 0 && iterations < maxIterations) {
            iterations += 1;

            let bestIndex = 0;
            for (let i = 1; i < open.length; i += 1) {
                if (fScore[open[i]] < fScore[open[bestIndex]]) {
                    bestIndex = i;
                }
            }

            const current = open[bestIndex];
            open.splice(bestIndex, 1);
            inOpen[current] = 0;

            if (current === endIdx) {
                found = true;
                break;
            }

            closed[current] = 1;

            const currentCol = current % this.cols;
            const currentRow = Math.floor(current / this.cols);

            const currentH = this.heuristic({ col: currentCol, row: currentRow }, endNode);
            if (currentH < closestH) {
                closestH = currentH;
                closestIdx = current;
            }

            for (const neighbor of this.getNeighbors(currentCol, currentRow)) {
                const nCol = neighbor.col;
                const nRow = neighbor.row;
                const nIdx = this.toIndex(nCol, nRow);
                if (closed[nIdx]) continue;

                const tentativeG = gScore[current] + neighbor.cost;
                if (tentativeG >= gScore[nIdx]) continue;

                cameFrom[nIdx] = current;
                gScore[nIdx] = tentativeG;
                fScore[nIdx] = tentativeG + this.heuristic({ col: nCol, row: nRow }, endNode);

                if (!inOpen[nIdx]) {
                    open.push(nIdx);
                    inOpen[nIdx] = 1;
                }
            }
        }

        const targetIdx = found ? endIdx : closestIdx;
        if (targetIdx === startIdx) return [];

        const path = this.reconstructPath(targetIdx, cameFrom, startIdx, startPos, found ? endPos : null);
        return path;
    }

    normalizePoints(start, end, endY, endX) {
        if (start && typeof start === 'object') {
            if (!end || typeof end !== 'object') return null;
            if (!Number.isFinite(start.x) || !Number.isFinite(start.y)) return null;
            if (!Number.isFinite(end.x) || !Number.isFinite(end.y)) return null;
            return { startPos: start, endPos: end };
        }

        if (Number.isFinite(start) && Number.isFinite(end) && Number.isFinite(endY) && Number.isFinite(endX)) {
            return {
                startPos: { x: start, y: end },
                endPos: { x: endY, y: endX }
            };
        }

        return null;
    }

    ensureGrid() {
        const { width, height } = this.getWorldSize();
        const wallsCount = this.scene.walls?.getChildren?.().length ?? 0;
        const obstaclesCount = this.scene.obstacles?.getChildren?.().length ?? 0;
        const roomKey = this.scene.currentRoomIndex ?? '0';
        const gridKey = `${width}|${height}|${this.cellSize}|${wallsCount}|${obstaclesCount}|${roomKey}`;

        if (this.grid && this.lastGridKey === gridKey) return;

        this.worldWidth = width;
        this.worldHeight = height;
        this.cols = Math.max(1, Math.ceil(width / this.cellSize));
        this.rows = Math.max(1, Math.ceil(height / this.cellSize));
        this.grid = Array.from({ length: this.rows }, () => new Uint8Array(this.cols));

        this.buildObstacleGrid();
        this.lastGridKey = gridKey;
    }

    getWorldSize() {
        const bounds = this.scene.physics?.world?.bounds;
        const width = this.scene.worldWidth ?? bounds?.width ?? this.scene.scale?.width ?? 800;
        const height = this.scene.worldHeight ?? bounds?.height ?? this.scene.scale?.height ?? 600;
        return { width, height };
    }

    buildObstacleGrid() {
        const obstacles = [];
        const addGroup = (group) => {
            if (!group?.getChildren) return;
            for (const obj of group.getChildren()) {
                if (!obj) continue;
                let rect = null;
                if (obj.body) {
                    rect = {
                        x: obj.body.x,
                        y: obj.body.y,
                        width: obj.body.width,
                        height: obj.body.height
                    };
                } else if (typeof obj.getBounds === 'function') {
                    const bounds = obj.getBounds();
                    rect = {
                        x: bounds.x,
                        y: bounds.y,
                        width: bounds.width,
                        height: bounds.height
                    };
                }
                if (!rect) continue;
                const pad = this.clearance;
                obstacles.push({
                    x: rect.x - pad,
                    y: rect.y - pad,
                    width: rect.width + pad * 2,
                    height: rect.height + pad * 2
                });
            }
        };

        addGroup(this.scene.walls);
        addGroup(this.scene.obstacles);

        if (obstacles.length === 0) return;

        for (const rect of obstacles) {
            const startCol = clamp(Math.floor(rect.x / this.cellSize), 0, this.cols - 1);
            const endCol = clamp(Math.floor((rect.x + rect.width) / this.cellSize), 0, this.cols - 1);
            const startRow = clamp(Math.floor(rect.y / this.cellSize), 0, this.rows - 1);
            const endRow = clamp(Math.floor((rect.y + rect.height) / this.cellSize), 0, this.rows - 1);

            for (let row = startRow; row <= endRow; row += 1) {
                for (let col = startCol; col <= endCol; col += 1) {
                    const cellRect = {
                        x: col * this.cellSize,
                        y: row * this.cellSize,
                        width: this.cellSize,
                        height: this.cellSize
                    };
                    if (rectsOverlap(cellRect, rect)) {
                        this.grid[row][col] = 1;
                    }
                }
            }
        }
    }

    worldToCell(x, y) {
        const clampedX = clamp(x, 0, this.worldWidth - 1);
        const clampedY = clamp(y, 0, this.worldHeight - 1);
        return {
            col: clamp(Math.floor(clampedX / this.cellSize), 0, this.cols - 1),
            row: clamp(Math.floor(clampedY / this.cellSize), 0, this.rows - 1)
        };
    }

    cellToWorld(col, row) {
        return {
            x: clamp(col * this.cellSize + this.cellSize * 0.5, 0, this.worldWidth),
            y: clamp(row * this.cellSize + this.cellSize * 0.5, 0, this.worldHeight)
        };
    }

    toIndex(col, row) {
        return row * this.cols + col;
    }

    isWalkable(col, row) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return false;
        return this.grid[row][col] === 0;
    }

    findNearestWalkable(cell) {
        if (this.isWalkable(cell.col, cell.row)) return cell;
        const maxRadius = Math.max(this.cols, this.rows);

        for (let radius = 1; radius < maxRadius; radius += 1) {
            for (let dx = -radius; dx <= radius; dx += 1) {
                const colA = cell.col + dx;
                const rowA = cell.row + radius;
                if (this.isWalkable(colA, rowA)) return { col: colA, row: rowA };
                const rowB = cell.row - radius;
                if (this.isWalkable(colA, rowB)) return { col: colA, row: rowB };
            }
            for (let dy = -radius + 1; dy <= radius - 1; dy += 1) {
                const rowA = cell.row + dy;
                const colA = cell.col + radius;
                if (this.isWalkable(colA, rowA)) return { col: colA, row: rowA };
                const colB = cell.col - radius;
                if (this.isWalkable(colB, rowA)) return { col: colB, row: rowA };
            }
        }
        return null;
    }

    heuristic(a, b) {
        const dx = Math.abs(a.col - b.col);
        const dy = Math.abs(a.row - b.row);
        const min = Math.min(dx, dy);
        const max = Math.max(dx, dy);
        return (Math.SQRT2 * min) + (max - min);
    }

    getNeighbors(col, row) {
        const neighbors = [];
        const directions = [
            { dx: 1, dy: 0, cost: 1 },
            { dx: -1, dy: 0, cost: 1 },
            { dx: 0, dy: 1, cost: 1 },
            { dx: 0, dy: -1, cost: 1 },
            { dx: 1, dy: 1, cost: Math.SQRT2 },
            { dx: 1, dy: -1, cost: Math.SQRT2 },
            { dx: -1, dy: 1, cost: Math.SQRT2 },
            { dx: -1, dy: -1, cost: Math.SQRT2 }
        ];

        for (const dir of directions) {
            const nCol = col + dir.dx;
            const nRow = row + dir.dy;
            if (!this.isWalkable(nCol, nRow)) continue;

            if (dir.dx !== 0 && dir.dy !== 0) {
                if (!this.isWalkable(col + dir.dx, row) || !this.isWalkable(col, row + dir.dy)) {
                    continue;
                }
            }

            neighbors.push({ col: nCol, row: nRow, cost: dir.cost });
        }

        return neighbors;
    }

    reconstructPath(targetIdx, cameFrom, startIdx, startPos, endPos) {
        const indices = [];
        let current = targetIdx;
        while (current !== -1 && current !== startIdx) {
            indices.push(current);
            current = cameFrom[current];
        }
        indices.reverse();

        const points = indices.map((idx) => {
            const col = idx % this.cols;
            const row = Math.floor(idx / this.cols);
            return this.cellToWorld(col, row);
        });

        if (endPos) {
            if (points.length === 0) {
                points.push({ x: endPos.x, y: endPos.y });
            } else {
                const last = points[points.length - 1];
                const dist = Math.hypot(last.x - endPos.x, last.y - endPos.y);
                if (dist < this.cellSize * 0.25) {
                    points[points.length - 1] = { x: endPos.x, y: endPos.y };
                } else {
                    points.push({ x: endPos.x, y: endPos.y });
                }
            }
        }

        if (points.length > 1) {
            const first = points[0];
            const dist = Math.hypot(first.x - startPos.x, first.y - startPos.y);
            if (dist < this.cellSize * 0.35) {
                points.shift();
            }
        }

        return points;
    }
}

export class ChaseBehavior {
    constructor(enemy, pathfinding) {
        this.enemy = enemy;
        this.pathfinding = pathfinding;
        this.timer = 0;
    }

    execute(delta) {
        const player = this.enemy.player;
        if (!player) return;

        this.timer += delta;
        const interval = this.enemy.pathUpdateInterval || 500;
        const needsUpdate = this.timer >= interval || this.enemy.currentPath.length === 0;

        if (needsUpdate) {
            const startPos = typeof this.enemy.getSelfTargetPoint === 'function'
                ? this.enemy.getSelfTargetPoint()
                : { x: this.enemy.x, y: this.enemy.y };
            const endPos = typeof this.enemy.getPlayerTargetPoint === 'function'
                ? this.enemy.getPlayerTargetPoint()
                : { x: player.x, y: player.y };
            if (!endPos) return;
            const path = this.pathfinding.findPath(
                { x: startPos.x, y: startPos.y },
                { x: endPos.x, y: endPos.y }
            );
            this.enemy.setPath(path);
            this.timer = 0;
        }
    }
}

export class KeepDistanceBehavior {
    constructor(enemy, pathfinding, idealDistance = 180) {
        this.enemy = enemy;
        this.pathfinding = pathfinding;
        this.idealDistance = idealDistance;
        this.tolerance = 30;
    }

    execute(delta) {
        const player = this.enemy.player;
        if (!player) return;

        const dist = this.enemy.getDistanceToPlayer();
        let target = null;
        const selfPos = typeof this.enemy.getSelfTargetPoint === 'function'
            ? this.enemy.getSelfTargetPoint()
            : { x: this.enemy.x, y: this.enemy.y };
        const playerPos = typeof this.enemy.getPlayerTargetPoint === 'function'
            ? this.enemy.getPlayerTargetPoint()
            : { x: player.x, y: player.y };
        if (!playerPos) return;

        if (dist > this.idealDistance + this.tolerance) {
            target = { x: playerPos.x, y: playerPos.y };
        } else if (dist < this.idealDistance - this.tolerance) {
            const dir = this.enemy.getDirectionToPlayer();
            target = {
                x: selfPos.x - dir.x * (this.idealDistance - dist + 30),
                y: selfPos.y - dir.y * (this.idealDistance - dist + 30)
            };
        } else {
            this.enemy.stopMovement();
            return;
        }

        const path = this.pathfinding.findPath(
            { x: selfPos.x, y: selfPos.y },
            target
        );
        this.enemy.setPath(path);
    }
}

export class MeleeAttackBehavior {
    constructor(enemy, options = {}) {
        this.enemy = enemy;
        this.cooldown = options.cooldown ?? enemy.config.attackCooldown ?? 600;
        this.damage = options.damage ?? enemy.config.damage ?? 10;
        this.lastAttackTime = 0;
    }

    execute(delta) {
        const player = this.enemy.player;
        if (!player) return;
        if (!this.enemy.isPlayerInAttackRange()) return;

        const overlapping = typeof this.enemy.isPlayerOverlapping === 'function'
            ? this.enemy.isPlayerOverlapping()
            : !!(
                this.enemy.body &&
                player.body &&
                Phaser.Geom.Intersects.RectangleToRectangle(this.enemy.body, player.body)
            );
        if (!overlapping) return;

        const now = this.enemy.scene.time.now;
        if (now - this.lastAttackTime < this.cooldown) return;

        this.lastAttackTime = now;
        this.enemy.isAttacking = true;
        if (typeof player.receiveHit === 'function') {
            player.receiveHit(this.damage, this.enemy);
        }
        this.enemy.scene.time.delayedCall(150, () => {
            if (this.enemy.active) {
                this.enemy.isAttacking = false;
            }
        });
    }
}

export class RangedAttackBehavior {
    constructor(enemy, options = {}) {
        this.enemy = enemy;
        this.cooldown = options.cooldown ?? enemy.config.attackCooldown ?? 1200;
        this.damage = options.damage ?? enemy.config.damage ?? 8;
        this.lastAttackTime = 0;
    }

    execute(delta) {
        const player = this.enemy.player;
        if (!player) return;
        if (!this.enemy.isPlayerInAttackRange()) return;

        const now = this.enemy.scene.time.now;
        if (now - this.lastAttackTime < this.cooldown) return;

        this.lastAttackTime = now;
        if (typeof player.receiveHit === 'function') {
            player.receiveHit(this.damage, this.enemy);
        }
    }
}
