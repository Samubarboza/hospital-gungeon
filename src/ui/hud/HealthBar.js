export class HealthBar {
    constructor(scene, x, y, maxHealth) {
        this.scene = scene;
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        
        // Configuración de la barra
        this.barWidth = 200;
        this.barHeight = 20;
        this.x = x;
        this.y = y;
        
        // Contenedor para agrupar todos los elementos
        this.container = this.scene.add.container(x, y);
        this.container.setScrollFactor(0); // Fijo en pantalla
        this.container.setDepth(100);
        
        // Fondo de la barra (borde)
        this.barBorder = this.scene.add.rectangle(
            0, 
            0, 
            this.barWidth + 4, 
            this.barHeight + 4, 
            0x000000
        );
        
        // Fondo interno de la barra
        this.barBackground = this.scene.add.rectangle(
            0, 
            0, 
            this.barWidth, 
            this.barHeight, 
            0x404040
        );
        
        // Barra de vida (relleno)
        this.bar = this.scene.add.rectangle(
            -this.barWidth / 2, 
            0, 
            this.barWidth, 
            this.barHeight, 
            0xff0000
        );
        this.bar.setOrigin(0, 0.5);
        
        // Texto de HP
        this.text = this.scene.add.text(
            0, 
            0, 
            `${this.currentHealth} / ${this.maxHealth}`, 
            {
                fontSize: '14px',
                fontFamily: 'Arial',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3
            }
        );
        this.text.setOrigin(0.5, 0.5);
        
        // Icono de corazón (opcional)
        this.heartIcon = this.scene.add.text(
            -this.barWidth / 2 - 20,
            0,
            '❤',
            {
                fontSize: '20px'
            }
        );
        this.heartIcon.setOrigin(0.5, 0.5);
        
        // Agregar todos los elementos al contenedor
        this.container.add([
            this.barBorder,
            this.barBackground,
            this.bar,
            this.text,
            this.heartIcon
        ]);
    }
    
    /**
     * Actualiza la barra de vida
     * @param {number} health - Vida actual
     */
    setHealth(health) {
        this.currentHealth = Phaser.Math.Clamp(health, 0, this.maxHealth);
        
        // Calcular el porcentaje de vida
        const percentage = this.currentHealth / this.maxHealth;
        
        // Animar la barra
        this.scene.tweens.add({
            targets: this.bar,
            displayWidth: this.barWidth * percentage,
            duration: 200,
            ease: 'Power2'
        });
        
        // Cambiar color según el porcentaje de vida
        if (percentage > 0.5) {
            this.bar.setFillStyle(0x00ff00); // Verde
        } else if (percentage > 0.25) {
            this.bar.setFillStyle(0xffff00); // Amarillo
        } else {
            this.bar.setFillStyle(0xff0000); // Rojo
        }
        
        // Actualizar texto
        this.text.setText(`${Math.ceil(this.currentHealth)} / ${this.maxHealth}`);
        
        // Efecto de parpadeo si recibe daño
        if (health < this.currentHealth) {
            this.scene.tweens.add({
                targets: this.container,
                alpha: 0.5,
                duration: 100,
                yoyo: true,
                repeat: 2
            });
        }
    }
    
    /**
     * Reduce la vida
     * @param {number} damage - Cantidad de daño
     */
    takeDamage(damage) {
        this.setHealth(this.currentHealth - damage);
    }
    
    /**
     * Restaura vida
     * @param {number} amount - Cantidad de vida a restaurar
     */
    heal(amount) {
        this.setHealth(this.currentHealth + amount);
    }
    
    /**
     * Restaura toda la vida
     */
    fullHeal() {
        this.setHealth(this.maxHealth);
    }
    
    /**
     * Cambia la posición de la barra
     * @param {number} x - Nueva posición X
     * @param {number} y - Nueva posición Y
     */
    setPosition(x, y) {
        this.container.setPosition(x, y);
    }
    
    /**
     * Muestra u oculta la barra
     * @param {boolean} visible - true para mostrar, false para ocultar
     */
    setVisible(visible) {
        this.container.setVisible(visible);
    }
    
    /**
     * Destruye la barra y limpia recursos
     */
    destroy() {
        this.container.destroy();
    }
}
