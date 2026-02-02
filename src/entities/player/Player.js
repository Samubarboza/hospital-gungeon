// src/entities/player/Player.js

import { PlayerController } from './PlayerController.js';
import { PlayerStats } from './PlayerStats.js';
import { Bullet } from './bullet.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player'); // 'player' es la clave del sprite, asegúrate de cargarla en preload()

    // Agregar el jugador a la escena y habilitar la física.
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Configurar las propiedades físicas.
    this.setCollideWorldBounds(true); // Evita que el jugador se salga de la pantalla.
    // --- NUEVAS LÍNEAS ---
    // 1. Hacemos que el sprite se vea 4 veces más pequeño
    this.setScale(0.2);
    // 2. Ajustamos el cuerpo físico (Hitbox)
    // El sprite tiene mucho espacio vacío alrededor. 
    // Vamos a crear una caja de 100x120 dentro del cuadro original
    // y la centraremos en el cuerpo del dibujo.
    this.body.setSize(120, 140);
    this.body.setOffset(65, 60); // Estos valores centran la caja en el pecho/pies

    // Instanciar las estadísticas y el controlador.
    this.stats = new PlayerStats();
    this.controller = new PlayerController(scene, this);
    // Creamos un GRUPO de balas. Es más eficiente que crear balas sueltas.
    this.bullets = scene.physics.add.group({
            classType: Bullet,
            maxSize: 10,         // Máximo de balas activas al mismo tiempo
            runChildUpdate: true // Hace que cada bala ejecute su propio movimiento
        });
  }

  // Método que se llamará en cada frame del juego.
  update() {
    // Actualizar el controlador.
    this.controller.update();
  }
  receiveHit(damage) {
    this.stats.takeDamage(damage);
    
    // EFECTO VISUAL: Parpadeo rojo
    this.setTint(0xff0000); // Ponemos un filtro rojo
    this.scene.time.delayedCall(100, () => {
        this.clearTint(); // Quitamos el filtro después de 0.1 segundos
    });
  }
}  