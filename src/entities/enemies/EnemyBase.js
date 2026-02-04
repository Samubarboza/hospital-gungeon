/**
 * Clase base para todos los enemigos del juego
 * Proporciona funcionalidad común y estructura para diferentes tipos de enemigos
 */
export default class EnemyBase extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, config = {}) {
        super(scene, x, y, texture);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Configuración base
        this.scene = scene;
        this.config = {
            speed: config.speed || 100,
            health: config.health || 100,
            damage: config.damage || 10,
            detectionRange: config.detectionRange || 200,
            attackRange: config.attackRange || 50,
            ...config
        };

        const originX = this.config.originX ?? 0.5;
        const originY = this.config.originY ?? 1;
        this.setOrigin(originX, originY);

        if (this.config.scale) {
            this.setScale(this.config.scale);
        }
        
        // Estado del enemigo
        this.health = this.config.health;
        this.maxHealth = this.config.health;
        this.isDead = false;
        this.isAttacking = false;
        
        // Referencia al jugador
        this.player = null;
        
        // Path para A*
        this.currentPath = [];
        this.currentPathIndex = 0;
        this.pathUpdateTimer = 0;
        this.pathUpdateInterval = 500; // Actualizar path cada 500ms
        
        // Configuración de físicas
        this.setCollideWorldBounds(true);
        this.setBounce(0.2);

        if (this.body) {
            if (this.config.bodySize) {
                this.body.setSize(this.config.bodySize.width, this.config.bodySize.height);
                this.body.setOffset(this.config.bodySize.offsetX ?? 0, this.config.bodySize.offsetY ?? 0);
            } else {
                const scaleX = this.config.bodyScaleX ?? this.config.bodyScale ?? 0.55;
                const scaleY = this.config.bodyScaleY ?? this.config.bodyScale ?? 0.55;
                const bodyWidth = this.displayWidth * scaleX;
                const bodyHeight = this.displayHeight * scaleY;
                this.body.setSize(bodyWidth, bodyHeight);
                this.body.setOffset(
                    (this.displayWidth - bodyWidth) / 2,
                    (this.displayHeight - bodyHeight) / 2
                );
            }
        }

        // Separación entre enemigos para evitar apilamiento
        this.separationGroup = this.config.separationGroup || null;
        this.separationRadius = this.config.separationRadius ?? 70;
        this.separationStrength = this.config.separationStrength ?? 140;
        
        // Máquina de estados (se inicializa en clases hijas)
        this.stateMachine = null;
    }
    
    /**
     * Establece la referencia al jugador
     */
    setPlayer(player) {
        this.player = player;
    }
    
    /**
     * Actualización principal del enemigo
     */
    update(time, delta) {
        if (this.isDead) return;
        
        // Actualizar máquina de estados
        if (this.stateMachine) {
            this.stateMachine.update(time, delta);
        }
        
        // Seguir el path si existe
        this.followPath(delta);

        // Aplicar separación entre enemigos
        this.applySeparation();
    }
    
    /**
     * Calcula la distancia al jugador
     */
    getDistanceToPlayer() {
        if (!this.player) return Infinity;
        const selfPos = this.getSelfTargetPoint();
        const playerPos = this.getPlayerTargetPoint();
        if (!playerPos) return Infinity;
        return Phaser.Math.Distance.Between(
            selfPos.x, selfPos.y,
            playerPos.x, playerPos.y
        );
    }
    
    /**
     * Verifica si el jugador está en rango de detección
     */
    canDetectPlayer() {
        return this.getDistanceToPlayer() <= this.config.detectionRange;
    }
    
    /**
     * Verifica si el jugador está en rango de ataque
     */
    isPlayerInAttackRange() {
        return this.getDistanceToPlayer() <= this.config.attackRange;
    }

    /**
     * Verifica si el jugador se solapa con el enemigo (cuerpo a cuerpo)
     */
    isPlayerOverlapping() {
        if (!this.player || !this.body || !this.player.body) return false;
        const pad = this.config.attackOverlapPadding ?? -6;
        const width = Math.max(this.body.width + pad * 2, 2);
        const height = Math.max(this.body.height + pad * 2, 2);
        const enemyRect = {
            x: this.body.x - pad,
            y: this.body.y - pad,
            width,
            height
        };
        const playerRect = {
            x: this.player.body.x,
            y: this.player.body.y,
            width: this.player.body.width,
            height: this.player.body.height
        };
        return Phaser.Geom.Intersects.RectangleToRectangle(enemyRect, playerRect);
    }

    getSelfTargetPoint() {
        if (this.body?.center) {
            return { x: this.body.center.x, y: this.body.center.y };
        }
        return { x: this.x, y: this.y };
    }

    getPlayerTargetPoint() {
        if (!this.player) return null;
        if (this.player.body?.center) {
            return { x: this.player.body.center.x, y: this.player.body.center.y };
        }
        return { x: this.player.x, y: this.player.y };
    }
    
    /**
     * Obtiene la dirección hacia el jugador
     */
    getDirectionToPlayer() {
        if (!this.player) return { x: 0, y: 0 };
        const selfPos = this.getSelfTargetPoint();
        const playerPos = this.getPlayerTargetPoint();
        if (!playerPos) return { x: 0, y: 0 };
        const angle = Phaser.Math.Angle.Between(
            selfPos.x, selfPos.y,
            playerPos.x, playerPos.y
        );
        
        return {
            x: Math.cos(angle),
            y: Math.sin(angle)
        };
    }
    
    /**
     * Sigue el path calculado por A*
     */
    followPath(delta) {
        if (this.currentPath.length === 0) {
            this.setVelocity(0, 0);
            return;
        }
        
        const target = this.currentPath[this.currentPathIndex];
        if (!target) return;
        const selfPos = this.getSelfTargetPoint();
        const distance = Phaser.Math.Distance.Between(
            selfPos.x, selfPos.y,
            target.x, target.y
        );
        
        // Si llegamos al punto actual, pasar al siguiente
        if (distance < 5) {
            this.currentPathIndex++;
            
            // Si completamos el path, limpiarlo
            if (this.currentPathIndex >= this.currentPath.length) {
                this.currentPath = [];
                this.currentPathIndex = 0;
                this.setVelocity(0, 0);
            }
            return;
        }
        
        // Moverse hacia el punto actual del path
        const angle = Phaser.Math.Angle.Between(
            selfPos.x, selfPos.y,
            target.x, target.y
        );
        
        this.setVelocity(
            Math.cos(angle) * this.config.speed,
            Math.sin(angle) * this.config.speed
        );
    }
    
    /**
     * Establece un nuevo path para seguir
     */
    setPath(path) {
        this.currentPath = path;
        this.currentPathIndex = 0;
    }
    
    /**
     * Detiene el movimiento
     */
    stopMovement() {
        this.setVelocity(0, 0);
        this.currentPath = [];
        this.currentPathIndex = 0;
    }

    /**
     * Evita que los enemigos se apilen en un mismo punto
     */
    applySeparation() {
        if (!this.separationGroup || !this.body) return;

        const radius = this.separationRadius;
        const strength = this.separationStrength;
        if (radius <= 0 || strength <= 0) return;

        let sepX = 0;
        let sepY = 0;
        const others = this.separationGroup.getChildren?.() || [];

        for (const other of others) {
            if (!other || other === this || !other.active) continue;
            const dx = this.x - other.x;
            const dy = this.y - other.y;
            const dist = Math.hypot(dx, dy);
            if (dist === 0 || dist > radius) continue;
            const force = ((radius - dist) / radius) * strength;
            sepX += (dx / dist) * force;
            sepY += (dy / dist) * force;
        }

        if (sepX === 0 && sepY === 0) return;

        let scale = 1;
        if (this.player && this.player.body) {
            const overlapping = Phaser.Geom.Intersects.RectangleToRectangle(this.body, this.player.body);
            if (overlapping) scale = 0.25;
        }
        if (this.stateMachine?.getCurrentStateName?.() === 'ATTACK') {
            scale *= 0.5;
        }

        this.body.velocity.x += sepX * scale;
        this.body.velocity.y += sepY * scale;

        const maxSpeed = this.config.speed || 0;
        if (maxSpeed > 0) {
            const len = Math.hypot(this.body.velocity.x, this.body.velocity.y);
            if (len > maxSpeed) {
                this.body.velocity.x = (this.body.velocity.x / len) * maxSpeed;
                this.body.velocity.y = (this.body.velocity.y / len) * maxSpeed;
            }
        }
    }
    
    /**
     * Recibe daño
     */
    takeDamage(amount) {
        if (this.isDead) return;
        
        this.health -= amount;
        
        // Efecto visual de daño
        this.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            this.clearTint();
        });
        
        if (this.health <= 0) {
            this.die();
        }
    }
    
    /**
     * Maneja la muerte del enemigo
     */
    die() {
        this.isDead = true;
        this.setVelocity(0, 0);
        if (this.body) {
            this.body.enable = false;
        }
        this.setActive(false);
        
        // Animación de muerte
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scale: 0.5,
            duration: 300,
            onComplete: () => {
                this.destroy();
            }
        });

        this.scene.events.emit('enemyKilled', this);
    }
    
    /**
     * Limpieza al destruir
     */
    destroy(fromScene) {
        if (this.stateMachine) {
            this.stateMachine.destroy();
        }
        super.destroy(fromScene);
    }
}
