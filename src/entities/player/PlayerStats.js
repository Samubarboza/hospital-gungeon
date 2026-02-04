// src/entities/player/PlayerStats.js
import { PLAYER_BASE_STATS, getDifficultyConfig } from '../../core/DifficultyConfig.js';
export class PlayerStats {
    constructor(difficultyConfig = null) {
        const config = difficultyConfig || getDifficultyConfig();
        const playerTuning = config.player;
        const damageTuning = config.damage;

        this.maxHealth = Math.round(PLAYER_BASE_STATS.health * playerTuning.healthMultiplier);
        this.health = this.maxHealth;
        this.speed = PLAYER_BASE_STATS.speed * playerTuning.speedMultiplier;
        this.damage = Math.round(PLAYER_BASE_STATS.damage * playerTuning.damageMultiplier * damageTuning.playerMultiplier);
        this.isDead = false;
        this.runMultiplier = PLAYER_BASE_STATS.runMultiplier;

        // --- Atributos de munición ---
        this.maxAmmo = Math.max(1, Math.round(PLAYER_BASE_STATS.maxAmmo * playerTuning.ammoMultiplier));
        this.currentAmmo = this.maxAmmo;
        this.isReloading = false;
        this.shotCount = 1;
        this.shotSpread = 0;
        this.ammoPerShot = 1;
        this.meleeDamage = Math.round(PLAYER_BASE_STATS.meleeDamage * playerTuning.meleeDamageMultiplier);    // Daño del golpe físico
        this.isAttacking = false; // Interruptor para ataque
        this.isInvulnerable = false; // El nuevo escudo temporal
        this.isKnockedBack = false;

    }

    takeDamage(amount) {
        if (this.isDead) return; // Si ya está muerto, no hacemos nada

        this.health -= amount; // RESTAMOS UNA SOLA VEZ
        
        if (this.health <= 0) {
            this.health = 0;
            this.isDead = true; // ¡Marcamos la muerte!
        }
    }

    heal(amount) {
        if (this.isDead) return; // Un muerto no puede curarse
        
        this.health += amount;
        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
        }
    }
}
