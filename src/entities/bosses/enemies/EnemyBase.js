import StateMachine from '../../sistemas/ia/StateMachine.js';

/**
 * Clase base para todos los enemigos
 */
export default class EnemyBase extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, config = {}) {
        super(scene, x, y, texture);

        // Añadir a la escena
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Configuración base
        this.config = {
            health: 100,
            speed: 100,
            detectionRange: 300,
            damage: 10,
            ...config
        };

        // Propiedades
        this.health = this.config.health;
        this.maxHealth = this.config.health;
        this.isAlive = true;
        this.target = null;
        
        // Máquina de estados (será inicializada por las clases hijas)
        this.stateMachine = null;

        // Configurar física
        this.setCollideWorldBounds(true);
        this.setBounce(0.2);

        // Datos de debug
        this.debugData = {
            state: 'idle',
            distance: 0
        };
    }

    /**
     * Inicializa la máquina de estados
     * Debe ser llamado por las clases hijas
     */
    initStateMachine(initialState, states) {
        this.stateMachine = new StateMachine(initialState, states, this);
    }

    /**
     * Establece el objetivo (normalmente el jugador)
     */
    setTarget(target) {
        this.target = target;
    }

    /**
     * Recibe daño
     */
    takeDamage(amount) {
        if (!this.isAlive) return;

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
     * Muerte del enemigo
     */
    die() {
        this.isAlive = false;
        this.setVelocity(0, 0);

        // Animación de muerte simple
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            duration: 300,
            onComplete: () => {
                this.destroy();
            }
        });

        // Emitir evento de muerte
        this.scene.events.emit('enemyKilled', this);
    }

    /**
     * Actualización principal
     */
    preUpdate(time, delta) {
        super.preUpdate(time, delta);

        if (!this.isAlive) return;

        // Actualizar máquina de estados
        if (this.stateMachine) {
            this.stateMachine.update(delta);
            this.debugData.state = this.stateMachine.getState();
        }

        // Actualizar distancia al objetivo para debug
        if (this.target) {
            const dx = this.x - this.target.x;
            const dy = this.y - this.target.y;
            this.debugData.distance = Math.sqrt(dx * dx + dy * dy);
        }
    }

    /**
     * Obtiene el estado actual
     */
    getState() {
        return this.stateMachine ? this.stateMachine.getState() : 'none';
    }

    /**
     * Obtiene información de debug
     */
    getDebugInfo() {
        return {
            type: this.constructor.name,
            state: this.debugData.state,
            health: `${this.health}/${this.maxHealth}`,
            distance: Math.round(this.debugData.distance),
            position: `${Math.round(this.x)}, ${Math.round(this.y)}`
        };
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