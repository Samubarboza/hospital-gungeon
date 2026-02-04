import EnemyBase from '../EnemyBase.js';
import { StateMachineBuilder, Conditions } from '../../../systems/ai/StateMachine.js';
import { AStarPathfinding, ChaseBehavior, MeleeAttackBehavior } from '../../../systems/ai/Behaviors.js';

/**
 * Walker - Enemigo que persigue al jugador usando A* y ataca cuerpo a cuerpo
 */
export default class Walker extends EnemyBase {
    constructor(scene, x, y, config = {}) {
        const defaultConfig = {
            speed: 120,
            health: 80,
            damage: 15,
            detectionRange: 250,
            attackRange: 40,
            texture: 'walker' // Puedes cambiar esto por el texture que uses
        };
        
        super(scene, x, y, config.texture || defaultConfig.texture, {
            ...defaultConfig,
            ...config
        });
        
        // Inicializar sistemas de IA
        this.pathfinding = new AStarPathfinding(scene);
        this.chaseBehavior = new ChaseBehavior(this, this.pathfinding);
        this.attackBehavior = new MeleeAttackBehavior(this);
        
        // Crear máquina de estados
        this.setupStateMachine();
        
        // Iniciar la máquina de estados
        this.stateMachine.start();
        
    }
    
    /**
     * Configura la máquina de estados del Walker
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
                'CHASE'
            )
            
            // Estado CHASE - Perseguir al jugador
            .state('CHASE')
            .onEnter((enemy) => {
                // Nada especial al entrar
            })
            .onUpdate((enemy, time, delta) => {
                // Usar el comportamiento de persecución con A*
                enemy.chaseBehavior.execute(delta);
            })
            .transition(
                Conditions.playerOutOfDetectionRange,
                'IDLE'
            )
            .transition(
                Conditions.playerInAttackRange,
                'ATTACK'
            )
            
            // Estado ATTACK - Atacar al jugador
            .state('ATTACK')
            .onEnter((enemy) => {
                enemy.stopMovement();
            })
            .onUpdate((enemy, time, delta) => {
                // Intentar atacar
                enemy.attackBehavior.execute(delta);

                // Si no hay solape, seguir acercándose para concretar el golpe
                if (!enemy.isPlayerOverlapping()) {
                    enemy.chaseBehavior.execute(delta);
                } else {
                    enemy.stopMovement();
                }
            })
            .transition(
                Conditions.playerOutOfDetectionRange,
                'IDLE'
            )
            .transition(
                Conditions.and(
                    Conditions.playerInDetectionRange,
                    Conditions.playerOutOfAttackRange
                ),
                'CHASE'
            )
            
            // Establecer estado inicial
            .initial('IDLE')
            
            // Construir la máquina
            .build();
    }
    
    /**
     * Actualización del Walker
     */
    update(time, delta) {
        super.update(time, delta);
        
        // Animación visual básica (opcional)
        this.updateVisuals();
    }
    
    /**
     * Actualiza los aspectos visuales del Walker
     */
    updateVisuals() {
        if (this.isDead) return;
        
        const state = this.stateMachine.getCurrentStateName();
        
        if (this.config.debugVisuals) {
            switch(state) {
                case 'IDLE':
                    this.setTint(0x88ff88);
                    break;
                case 'CHASE':
                    this.setTint(0xffff88);
                    break;
                case 'ATTACK':
                    this.setTint(0xff8888);
                    break;
            }
        }

        if (Math.abs(this.body.velocity.x) > 1) {
            this.setFlipX(this.body.velocity.x < 0);
        }
    }
    
    /**
     * Información de debug
     */
    getDebugInfo() {
        return {
            type: 'Walker',
            state: this.stateMachine.getCurrentStateName(),
            health: `${this.health}/${this.maxHealth}`,
            distanceToPlayer: Math.round(this.getDistanceToPlayer()),
            pathLength: this.currentPath.length
        };
    }
}
