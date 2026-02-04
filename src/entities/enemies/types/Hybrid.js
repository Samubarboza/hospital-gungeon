import Walker from './Walker.js';

/**
 * Enemigo híbrido: mismo comportamiento del Walker, pero con mejores stats
 */
export default class Hybrid extends Walker {
    constructor(scene, x, y, config = {}) {
        super(scene, x, y, {
            speed: config.speed ?? 150,
            damage: config.damage ?? 15,
            attackRange: config.attackRange ?? 70,
            attackCooldown: config.attackCooldown ?? 600,
            ...config
        });
    }
}
