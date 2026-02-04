// src/entities/player/PlayerStats.js
export class PlayerStats {
    constructor() {
        this.health = 100;
        this.maxHealth = 100;
        this.speed = 200;
        this.damage = 10;
        this.isDead = false;
        this.runMultiplier = 1.6;

        // --- Atributos de munición ---
        this.maxAmmo = 10;
        this.currentAmmo = 10;
        this.isReloading = false;
        this.shotCount = 1;
        this.shotSpread = 0;
        this.ammoPerShot = 1;
        this.meleeDamage = 25;    // Daño del golpe físico
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
