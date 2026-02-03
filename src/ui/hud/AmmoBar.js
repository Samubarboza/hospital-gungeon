export class AmmoBar {
    constructor(scene, x, y, maxAmmo, currentAmmo) {
        this.scene = scene;
        this.maxAmmo = maxAmmo;
        this.currentAmmo = currentAmmo || maxAmmo;
        
        // Configuración
        this.x = x;
        this.y = y;
        this.bulletSize = 12;
        this.bulletSpacing = 4;
        this.bulletsPerRow = 10;
        
        // Contenedor principal
        this.container = this.scene.add.container(x, y);
        this.container.setScrollFactor(0); // Fijo en pantalla
        this.container.setDepth(100);
        
        // Icono de munición
        this.ammoIcon = this.scene.add.text(
            0,
            0,
            '🔫',
            {
                fontSize: '24px'
            }
        );
        this.ammoIcon.setOrigin(0.5, 0.5);
        
        // Texto con cantidad de munición
        this.ammoText = this.scene.add.text(
            35,
            0,
            `${this.currentAmmo} / ${this.maxAmmo}`,
            {
                fontSize: '18px',
                fontFamily: 'Arial',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3,
                fontStyle: 'bold'
            }
        );
        this.ammoText.setOrigin(0, 0.5);
        
        // Array para almacenar los sprites de balas
        this.bullets = [];
        
        // Crear visualización de balas individuales
        this.createBulletDisplay();
        
        // Agregar elementos al contenedor
        this.container.add([this.ammoIcon, this.ammoText]);
    }
    
    /**
     * Crea la visualización de balas individuales
     */
    createBulletDisplay() {
        // Limpiar balas existentes
        this.bullets.forEach(bullet => bullet.destroy());
        this.bullets = [];
        
        const startX = 0;
        const startY = 35;
        
        for (let i = 0; i < this.maxAmmo; i++) {
            const row = Math.floor(i / this.bulletsPerRow);
            const col = i % this.bulletsPerRow;
            
            const bulletX = startX + col * (this.bulletSize + this.bulletSpacing);
            const bulletY = startY + row * (this.bulletSize + this.bulletSpacing);
            
            // Crear bala como rectángulo
            const bullet = this.scene.add.rectangle(
                bulletX,
                bulletY,
                this.bulletSize,
                this.bulletSize * 1.5,
                i < this.currentAmmo ? 0xffd700 : 0x404040
            );
            bullet.setStrokeStyle(2, 0x000000);
            
            this.bullets.push(bullet);
            this.container.add(bullet);
        }
    }
    
    /**
     * Actualiza la cantidad de munición
     * @param {number} ammo - Munición actual
     */
    setAmmo(ammo) {
        const previousAmmo = this.currentAmmo;
        this.currentAmmo = Phaser.Math.Clamp(ammo, 0, this.maxAmmo);
        
        // Actualizar texto
        this.ammoText.setText(`${this.currentAmmo} / ${this.maxAmmo}`);
        
        // Actualizar color del texto según munición
        if (this.currentAmmo === 0) {
            this.ammoText.setColor('#ff0000'); // Rojo si no hay munición
        } else if (this.currentAmmo <= this.maxAmmo * 0.25) {
            this.ammoText.setColor('#ffff00'); // Amarillo si queda poca
        } else {
            this.ammoText.setColor('#ffffff'); // Blanco normal
        }
        
        // Actualizar balas visuales
        this.updateBulletDisplay();
        
        // Efecto visual al disparar
        if (ammo < previousAmmo) {
            this.playShootEffect();
        }
        
        // Efecto visual al recargar
        if (ammo > previousAmmo) {
            this.playReloadEffect();
        }
    }
    
    /**
     * Actualiza la visualización de balas
     */
    updateBulletDisplay() {
        this.bullets.forEach((bullet, index) => {
            const isActive = index < this.currentAmmo;
            
            this.scene.tweens.add({
                targets: bullet,
                fillColor: isActive ? 0xffd700 : 0x404040,
                duration: 150,
                ease: 'Power2'
            });
        });
    }
    
    /**
     * Dispara una bala (reduce munición en 1)
     */
    shoot() {
        if (this.currentAmmo > 0) {
            this.setAmmo(this.currentAmmo - 1);
        }
    }
    
    /**
     * Recarga munición
     * @param {number} amount - Cantidad a recargar (por defecto, recarga completa)
     */
    reload(amount) {
        if (amount === undefined) {
            this.setAmmo(this.maxAmmo);
        } else {
            this.setAmmo(this.currentAmmo + amount);
        }
    }
    
    /**
     * Efecto visual al disparar
     */
    playShootEffect() {
        this.scene.tweens.add({
            targets: this.ammoIcon,
            scaleX: 1.2,
            scaleY: 0.8,
            duration: 100,
            yoyo: true,
            ease: 'Power2'
        });
    }
    
    /**
     * Efecto visual al recargar
     */
    playReloadEffect() {
        this.scene.tweens.add({
            targets: this.ammoText,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 150,
            yoyo: true,
            ease: 'Bounce'
        });
        
        // Efecto de brillo en las balas
        this.bullets.forEach((bullet, index) => {
            if (index < this.currentAmmo) {
                this.scene.tweens.add({
                    targets: bullet,
                    alpha: 0.5,
                    duration: 100,
                    yoyo: true,
                    delay: index * 20
                });
            }
        });
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
     * Cambia la munición máxima
     * @param {number} maxAmmo - Nueva munición máxima
     */
    setMaxAmmo(maxAmmo) {
        this.maxAmmo = maxAmmo;
        this.currentAmmo = Math.min(this.currentAmmo, maxAmmo);
        this.createBulletDisplay();
        this.ammoText.setText(`${this.currentAmmo} / ${this.maxAmmo}`);
    }
    
    /**
     * Obtiene la munición actual
     * @returns {number} Munición actual
     */
    getAmmo() {
        return this.currentAmmo;
    }
    
    /**
     * Verifica si hay munición
     * @returns {boolean} true si hay munición
     */
    hasAmmo() {
        return this.currentAmmo > 0;
    }
    
    /**
     * Destruye la barra y limpia recursos
     */
    destroy() {
        this.bullets.forEach(bullet => bullet.destroy());
        this.bullets = [];
        this.container.destroy();
    }
}
