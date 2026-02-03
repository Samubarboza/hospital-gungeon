import Walker from './tipos/Walker.js';
import Shooter from './tipos/Shooter.js';

/**
 * Fábrica para crear enemigos de diferentes tipos
 */
export default class EnemyFactory {
    /**
     * Tipos de enemigos disponibles
     */
    static TYPES = {
        WALKER: 'walker',
        SHOOTER: 'shooter'
    };

    /**
     * Registro de tipos de enemigos
     */
    static enemyRegistry = {
        [EnemyFactory.TYPES.WALKER]: Walker,
        [EnemyFactory.TYPES.SHOOTER]: Shooter
    };

    /**
     * Crea un enemigo del tipo especificado
     * @param {Phaser.Scene} scene - Escena donde crear el enemigo
     * @param {string} type - Tipo de enemigo (usar EnemyFactory.TYPES)
     * @param {number} x - Posición X
     * @param {number} y - Posición Y
     * @param {object} config - Configuración adicional
     * @returns {EnemyBase} Instancia del enemigo creado
     */
    static create(scene, type, x, y, config = {}) {
        const EnemyClass = this.enemyRegistry[type];

        if (!EnemyClass) {
            console.error(`Tipo de enemigo "${type}" no encontrado`);
            return null;
        }

        const enemy = new EnemyClass(scene, x, y, config);
        return enemy;
    }

    /**
     * Crea un Walker
     */
    static createWalker(scene, x, y, config = {}) {
        return this.create(scene, this.TYPES.WALKER, x, y, config);
    }

    /**
     * Crea un Shooter
     */
    static createShooter(scene, x, y, config = {}) {
        return this.create(scene, this.TYPES.SHOOTER, x, y, config);
    }

    /**
     * Crea múltiples enemigos a la vez
     * @param {Phaser.Scene} scene - Escena donde crear los enemigos
     * @param {Array} enemyData - Array de objetos con {type, x, y, config}
     * @returns {Array} Array de enemigos creados
     */
    static createBatch(scene, enemyData) {
        return enemyData.map(data => {
            const { type, x, y, config } = data;
            return this.create(scene, type, x, y, config);
        }).filter(enemy => enemy !== null);
    }

    /**
     * Crea enemigos en posiciones aleatorias dentro de un área
     * @param {Phaser.Scene} scene - Escena
     * @param {string} type - Tipo de enemigo
     * @param {number} count - Cantidad de enemigos
     * @param {object} bounds - {x, y, width, height} área donde crear
     * @param {object} config - Configuración adicional
     * @returns {Array} Array de enemigos creados
     */
    static createRandom(scene, type, count, bounds, config = {}) {
        const enemies = [];
        const { x, y, width, height } = bounds;

        for (let i = 0; i < count; i++) {
            const randomX = x + Math.random() * width;
            const randomY = y + Math.random() * height;
            
            const enemy = this.create(scene, type, randomX, randomY, config);
            if (enemy) {
                enemies.push(enemy);
            }
        }

        return enemies;
    }

    /**
     * Crea un grupo de enemigos mezclados
     * @param {Phaser.Scene} scene - Escena
     * @param {object} composition - Objeto con tipos y cantidades {walker: 3, shooter: 2}
     * @param {object} bounds - Área donde crear
     * @param {object} config - Configuración base
     * @returns {Array} Array de enemigos creados
     */
    static createMixedGroup(scene, composition, bounds, config = {}) {
        const enemies = [];

        Object.entries(composition).forEach(([type, count]) => {
            const groupEnemies = this.createRandom(scene, type, count, bounds, config);
            enemies.push(...groupEnemies);
        });

        return enemies;
    }

    /**
     * Crea enemigos en oleadas
     * @param {Phaser.Scene} scene - Escena
     * @param {Array} waves - Array de oleadas [{delay: 0, enemies: [{type, x, y}]}]
     * @returns {object} Objeto con métodos para controlar las oleadas
     */
    static createWaves(scene, waves) {
        const spawnedEnemies = [];
        let currentWave = 0;
        let isActive = true;

        const spawnNextWave = () => {
            if (!isActive || currentWave >= waves.length) {
                return;
            }

            const wave = waves[currentWave];
            const delay = wave.delay || 0;

            scene.time.delayedCall(delay, () => {
                if (!isActive) return;

                const enemies = this.createBatch(scene, wave.enemies);
                spawnedEnemies.push(...enemies);

                // Emitir evento de oleada
                scene.events.emit('waveSpawned', {
                    waveNumber: currentWave + 1,
                    enemies: enemies
                });

                currentWave++;
                spawnNextWave();
            });
        };

        // Iniciar las oleadas
        spawnNextWave();

        // Retornar objeto de control
        return {
            stop: () => {
                isActive = false;
            },
            getCurrentWave: () => currentWave,
            getTotalWaves: () => waves.length,
            getSpawnedEnemies: () => spawnedEnemies,
            isComplete: () => currentWave >= waves.length
        };
    }

    /**
     * Registra un nuevo tipo de enemigo personalizado
     * @param {string} type - Nombre del tipo
     * @param {class} EnemyClass - Clase del enemigo
     */
    static registerEnemyType(type, EnemyClass) {
        if (this.enemyRegistry[type]) {
            console.warn(`El tipo "${type}" ya existe y será sobrescrito`);
        }
        this.enemyRegistry[type] = EnemyClass;
    }

    /**
     * Obtiene todos los tipos registrados
     */
    static getRegisteredTypes() {
        return Object.keys(this.enemyRegistry);
    }

    /**
     * Verifica si un tipo existe
     */
    static hasType(type) {
        return !!this.enemyRegistry[type];
    }
}