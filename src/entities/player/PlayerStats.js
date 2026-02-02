// src/entities/player/PlayerStats.js
export class PlayerStats {
    constructor() {
        this.health = 100;
        this.speed = 200;
        this.damage = 10;

        // --- Atributos de munición ---
        this.maxAmmo = 10;
        this.currentAmmo = 10;
        this.isReloading = false;
        this.meleeDamage = 25;      // Daño del golpe físico
        this.isAttacking = false;   // Interruptor para no "spammiar" el golpe
    } 
        
    

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) { this.health = 0; }
        console.log("Vida actual:", this.health);
    }

    heal(amount) {
        this.health += amount; 
        if (this.health > 100) { this.health = 100; }
    }
}