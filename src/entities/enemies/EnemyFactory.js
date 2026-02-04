import Walker from './types/Walker.js';
import Shooter from './types/Shooter.js';
import Hybrid from './types/Hybrid.js';

/**
 * Factory para crear enemigos de diferentes tipos
 * Centraliza la creación y configuración de enemigos
 */
export default class EnemyFactory {
    /**
     * Tipos de enemigos disponibles
     */
    static TYPES = {
        WALKER: 'walker',
        SHOOTER: 'shooter',
        HYBRID: 'hybrid'
    };
    
    /**
     * Configuraciones predefinidas por dificultad
     */
    static DIFFICULTIES = {
        EASY: {
            walker: {
                speed: 100,
                health: 60,
                damage: 10,
                detectionRange: 200,
                attackRange: 35
            },
            shooter: {
                speed: 80,
                health: 50,
                damage: 8,
                detectionRange: 250,
                attackRange: 200,
                idealDistance: 150
            },
            hybrid: {
                speed: 120,
                health: 90,
                damage: 14,
                detectionRange: 260,
                attackRange: 45
            }
        },
        NORMAL: {
            walker: {
                speed: 120,
                health: 80,
                damage: 15,
                detectionRange: 250,
                attackRange: 40
            },
            shooter: {
                speed: 90,
                health: 60,
                damage: 12,
                detectionRange: 300,
                attackRange: 250,
                idealDistance: 180
            },
            hybrid: {
                speed: 140,
                health: 110,
                damage: 18,
                detectionRange: 300,
                attackRange: 55
            }
        },
        HARD: {
            walker: {
                speed: 140,
                health: 120,
                damage: 20,
                detectionRange: 300,
                attackRange: 45
            },
            shooter: {
                speed: 110,
                health: 80,
                damage: 18,
                detectionRange: 350,
                attackRange: 300,
                idealDistance: 200
            },
            hybrid: {
                speed: 170,
                health: 140,
                damage: 22,
                detectionRange: 340,
                attackRange: 65
            }
        }
    };
    
    constructor(scene) {
        this.scene = scene;
        this.enemies = new Map();
        this.nextId = 0;
        this.defaultDifficulty = 'NORMAL';
    }
    
    /**
     * Crea un enemigo del tipo especificado
     * @param {string} type - Tipo de enemigo (walker, shooter)
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @param {object} config - Configuración personalizada (opcional)
     * @returns {EnemyBase} El enemigo creado
     */
    create(type, x, y, config = {}) {
        let enemy = null;
        const difficulty = config.difficulty || this.defaultDifficulty;
        const baseConfig = this.getConfigForDifficulty(type, difficulty);
        const finalConfig = { ...baseConfig, ...config };
        
        switch(type.toLowerCase()) {
            case EnemyFactory.TYPES.WALKER:
                enemy = new Walker(this.scene, x, y, finalConfig);
                break;
                
            case EnemyFactory.TYPES.SHOOTER:
                enemy = new Shooter(this.scene, x, y, finalConfig);
                break;

            case EnemyFactory.TYPES.HYBRID:
                enemy = new Hybrid(this.scene, x, y, finalConfig);
                break;
                
            default:
                console.error(`EnemyFactory: Unknown enemy type "${type}"`);
                return null;
        }
        
        if (enemy) {
            // Asignar ID único
            enemy.enemyId = this.nextId++;
            
            // Guardar referencia
            this.enemies.set(enemy.enemyId, enemy);
            
            // Configurar eventos de destrucción
            enemy.once('destroy', () => {
                this.enemies.delete(enemy.enemyId);
            });
        }
        
        return enemy;
    }
    
    /**
     * Crea un Walker
     */
    createWalker(x, y, config = {}) {
        return this.create(EnemyFactory.TYPES.WALKER, x, y, config);
    }
    
    /**
     * Crea un Shooter
     */
    createShooter(x, y, config = {}) {
        return this.create(EnemyFactory.TYPES.SHOOTER, x, y, config);
    }

    /**
     * Crea un Hybrid
     */
    createHybrid(x, y, config = {}) {
        return this.create(EnemyFactory.TYPES.HYBRID, x, y, config);
    }
    
    /**
     * Crea múltiples enemigos de un tipo
     */
    createMultiple(type, positions, config = {}) {
        const enemies = [];
        
        for (const pos of positions) {
            const enemy = this.create(type, pos.x, pos.y, config);
            if (enemy) {
                enemies.push(enemy);
            }
        }
        
        return enemies;
    }
    
    /**
     * Crea un grupo de enemigos mixtos
     */
    createMixedGroup(specs) {
        const enemies = [];
        
        for (const spec of specs) {
            const enemy = this.create(
                spec.type,
                spec.x,
                spec.y,
                spec.config || {}
            );
            
            if (enemy) {
                enemies.push(enemy);
            }
        }
        
        return enemies;
    }
    
    /**
     * Crea enemigos en un patrón circular
     */
    createInCircle(type, centerX, centerY, radius, count, config = {}) {
        const enemies = [];
        const angleStep = (Math.PI * 2) / count;
        
        for (let i = 0; i < count; i++) {
            const angle = angleStep * i;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            const enemy = this.create(type, x, y, config);
            if (enemy) {
                enemies.push(enemy);
            }
        }
        
        return enemies;
    }
    
    /**
     * Crea enemigos en una formación de grid
     */
    createInGrid(type, startX, startY, rows, cols, spacing, config = {}) {
        const enemies = [];
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = startX + (col * spacing);
                const y = startY + (row * spacing);
                
                const enemy = this.create(type, x, y, config);
                if (enemy) {
                    enemies.push(enemy);
                }
            }
        }
        
        return enemies;
    }
    
    /**
     * Crea una oleada de enemigos con composición balanceada
     */
    createWave(waveNumber, spawnPoints) {
        const enemies = [];
        
        // Calcular composición según el número de oleada
        const walkerCount = Math.min(2 + waveNumber, 8);
        const shooterCount = Math.min(1 + Math.floor(waveNumber / 2), 5);
        
        // Dificultad según oleada
        const difficulty = waveNumber < 3 ? 'EASY' : 
                          waveNumber < 6 ? 'NORMAL' : 'HARD';
        
        // Crear walkers
        for (let i = 0; i < walkerCount; i++) {
            const spawnPoint = spawnPoints[i % spawnPoints.length];
            const enemy = this.createWalker(spawnPoint.x, spawnPoint.y, {
                difficulty: difficulty
            });
            if (enemy) enemies.push(enemy);
        }
        
        // Crear shooters
        for (let i = 0; i < shooterCount; i++) {
            const spawnPoint = spawnPoints[(walkerCount + i) % spawnPoints.length];
            const enemy = this.createShooter(spawnPoint.x, spawnPoint.y, {
                difficulty: difficulty
            });
            if (enemy) enemies.push(enemy);
        }
        
        return enemies;
    }
    
    /**
     * Obtiene la configuración para un tipo y dificultad específicos
     */
    getConfigForDifficulty(type, difficulty) {
        const difficultyConfigs = EnemyFactory.DIFFICULTIES[difficulty];
        
        if (!difficultyConfigs) {
            console.warn(`Unknown difficulty "${difficulty}", using NORMAL`);
            return EnemyFactory.DIFFICULTIES.NORMAL[type.toLowerCase()] || {};
        }
        
        return difficultyConfigs[type.toLowerCase()] || {};
    }
    
    /**
     * Establece el jugador para todos los enemigos existentes
     */
    setPlayerForAll(player) {
        this.enemies.forEach(enemy => {
            enemy.setPlayer(player);
        });
    }
    
    /**
     * Actualiza todos los enemigos
     */
    updateAll(time, delta) {
        this.enemies.forEach(enemy => {
            if (enemy && !enemy.isDead) {
                enemy.update(time, delta);
            }
        });
    }
    
    /**
     * Obtiene todos los enemigos activos
     */
    getAllEnemies() {
        return Array.from(this.enemies.values());
    }
    
    /**
     * Obtiene enemigos por tipo
     */
    getEnemiesByType(type) {
        return this.getAllEnemies().filter(enemy => {
            return enemy.constructor.name.toLowerCase() === type.toLowerCase();
        });
    }
    
    /**
     * Cuenta enemigos activos
     */
    getEnemyCount() {
        return this.enemies.size;
    }
    
    /**
     * Destruye todos los enemigos
     */
    destroyAll() {
        this.enemies.forEach(enemy => {
            if (enemy && enemy.active) {
                enemy.destroy();
            }
        });
        this.enemies.clear();
    }
    
    /**
     * Establece la dificultad por defecto
     */
    setDefaultDifficulty(difficulty) {
        if (EnemyFactory.DIFFICULTIES[difficulty]) {
            this.defaultDifficulty = difficulty;
        } else {
            console.warn(`Unknown difficulty "${difficulty}"`);
        }
    }
    
    /**
     * Información de debug
     */
    getDebugInfo() {
        const info = {
            totalEnemies: this.enemies.size,
            byType: {},
            byState: {}
        };
        
        this.enemies.forEach(enemy => {
            const type = enemy.constructor.name;
            const state = enemy.stateMachine?.getCurrentStateName() || 'unknown';
            
            info.byType[type] = (info.byType[type] || 0) + 1;
            info.byState[state] = (info.byState[state] || 0) + 1;
        });
        
        return info;
    }
}
