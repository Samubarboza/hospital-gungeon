import EnemyBase from '../EnemyBase.js';
import { StateMachineBuilder, Conditions } from '../../../systems/ai/StateMachine.js';
import { AStarPathfinding, KeepDistanceBehavior, RangedAttackBehavior } from '../../../systems/ai/Behaviors.js';

/**
 * Shooter - Enemigo que mantiene distancia y ataca con proyectiles
 */
export default class Shooter extends EnemyBase {
    constructor(scene, x, y, config = {}) {
        const defaultConfig = {
            speed: 90,
            health: 60,
            damage: 12,
            detectionRange: 300,
            attackRange: 250,
            idealDistance: 180, // Distancia ideal que intenta mantener
            texture: 'shooter' // Puedes cambiar esto por el texture que uses
        };
        
        super(scene, x, y, config.texture || defaultConfig.texture, {
            ...defaultConfig,
            ...config
        });
        
        // Guardar configuración específica
        this.idealDistance = this.config.idealDistance || 180;
        
        // Inicializar sistemas de IA
        this.pathfinding = new AStarPathfinding(scene);
        this.keepDistanceBehavior = new KeepDistanceBehavior(
            this, 
            this.pathfinding, 
            this.idealDistance
        );
        this.attackBehavior = new RangedAttackBehavior(this, {
            cooldown: 1800,
            speed: 250,
            damage: this.config.damage,
            texture: 'bullet' // Puedes cambiar esto
        });
        
        // Crear máquina de estados
        this.setupStateMachine();
        
        // Iniciar la máquina de estados
        this.stateMachine.start();
        
    }
    
    /**
     * Configura la máquina de estados del Shooter
     */
    setupStateMachine() {
        this.stateMachine = new StateMachineBuilder(this)
            // Estado IDLE - Esperando al jugador
            .state('IDLE')
            .onEnter((enemy) => {
                enemy.stopMovement();
            })
            .onUpdate((enemy, time, delta) => {
                // Simplemente esperar
            })
            .transition(
                Conditions.playerInDetectionRange,
                'POSITION'
            )
            
            // Estado POSITION - Mantener distancia ideal
            .state('POSITION')
            .onEnter((enemy) => {
                // Prepararse para posicionarse
            })
            .onUpdate((enemy, time, delta) => {
                // Usar el comportamiento de mantener distancia
                enemy.keepDistanceBehavior.execute(delta);
            })
            .transition(
                Conditions.playerOutOfDetectionRange,
                'IDLE'
            )
            .transition(
                Conditions.healthBelow(0.3),
                'RETREAT'
            )
            .transition(
                Conditions.and(
                    Conditions.playerInAttackRange,
                    (enemy) => {
                        const distance = enemy.getDistanceToPlayer();
                        // Está en la distancia ideal (con un margen)
                        return distance >= enemy.idealDistance * 0.8 && 
                               distance <= enemy.idealDistance * 1.2;
                    }
                ),
                'ATTACK'
            )
            
            // Estado ATTACK - Disparar al jugador
            .state('ATTACK')
            .onEnter((enemy) => {
                // Puede seguir moviéndose mientras ataca
            })
            .onUpdate((enemy, time, delta) => {
                // Mantener distancia mientras ataca
                enemy.keepDistanceBehavior.execute(delta);
                
                // Disparar si está en rango
                if (enemy.isPlayerInAttackRange()) {
                    enemy.attackBehavior.execute(delta);
                }
            })
            .transition(
                Conditions.playerOutOfDetectionRange,
                'IDLE'
            )
            .transition(
                Conditions.healthBelow(0.3),
                'RETREAT'
            )
            .transition(
                Conditions.playerOutOfAttackRange,
                'POSITION'
            )
            
            // Estado RETREAT - Alejarse si está en peligro
            .state('RETREAT')
            .onEnter((enemy) => {
                if (enemy.config.debugVisuals) {
                    enemy.setTint(0xff88ff);
                }
            })
            .onUpdate((enemy, time, delta) => {
                // Alejarse rápidamente
                const distance = enemy.getDistanceToPlayer();
                
                if (distance < enemy.idealDistance * 1.5) {
                    const playerPos = enemy.getPlayerTargetPoint?.() ?? { x: enemy.player.x, y: enemy.player.y };
                    const selfPos = enemy.getSelfTargetPoint?.() ?? { x: enemy.x, y: enemy.y };
                    const angle = Phaser.Math.Angle.Between(
                        playerPos.x, playerPos.y,
                        selfPos.x, selfPos.y
                    );
                    
                    // Moverse en dirección opuesta al jugador
                    const retreatX = selfPos.x + Math.cos(angle) * enemy.idealDistance * 2;
                    const retreatY = selfPos.y + Math.sin(angle) * enemy.idealDistance * 2;
                    
                    const path = enemy.pathfinding.findPath(
                        { x: selfPos.x, y: selfPos.y },
                        { x: retreatX, y: retreatY }
                    );
                    
                    enemy.setPath(path);
                }
            })
            .onExit((enemy) => {
                if (enemy.config.debugVisuals) {
                    enemy.setTint(0x8888ff);
                }
            })
            .transition(
                Conditions.playerOutOfDetectionRange,
                'IDLE'
            )
            .transition(
                Conditions.and(
                    Conditions.playerInDetectionRange,
                    Conditions.healthAbove(0.3)
                ),
                'POSITION'
            )
            
            // Establecer estado inicial
            .initial('IDLE')
            
            // Construir la máquina
            .build();
    }
    
    /**
     * Actualización del Shooter
     */
    update(time, delta) {
        super.update(time, delta);
        
        // Animación visual básica
        this.updateVisuals();
    }
    
    /**
     * Actualiza los aspectos visuales del Shooter
     */
    updateVisuals() {
        if (this.isDead) return;
        
        const state = this.stateMachine.getCurrentStateName();
        
        // Cambiar tint según el estado (si no está en RETREAT)
        if (this.config.debugVisuals && state !== 'RETREAT') {
            switch(state) {
                case 'IDLE':
                    this.setTint(0x8888ff);
                    break;
                case 'POSITION':
                    this.setTint(0xffff88);
                    break;
                case 'ATTACK':
                    this.setTint(0xff8888);
                    break;
            }
        }

        if (this.player) {
            this.setFlipX(this.player.x < this.x);
        }
    }
    
    /**
     * Override del método takeDamage para reaccionar
     */
    takeDamage(amount) {
        super.takeDamage(amount);
        
        // Si recibe daño, intentar alejarse momentáneamente
        if (this.health > 0 && this.health < this.maxHealth * 0.5) {
            // Pequeño impulso hacia atrás
            const direction = this.getDirectionToPlayer();
            this.setVelocity(
                -direction.x * this.config.speed * 1.5,
                -direction.y * this.config.speed * 1.5
            );
        }
    }
    
    /**
     * Información de debug
     */
    getDebugInfo() {
        return {
            type: 'Shooter',
            state: this.stateMachine.getCurrentStateName(),
            health: `${this.health}/${this.maxHealth}`,
            distanceToPlayer: Math.round(this.getDistanceToPlayer()),
            idealDistance: this.idealDistance,
            pathLength: this.currentPath.length,
            canAttack: this.attackBehavior.canAttack
        };
    }
}
