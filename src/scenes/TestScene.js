// // src/scenes/TestScene.js
// import { Player } from '../entities/player/Player.js'; 

// export default class TestScene extends Phaser.Scene {
//     constructor() {
//         super('TestScene');
//     }

//     create() {
//         // Color de fondo para ver los límites
//         this.cameras.main.setBackgroundColor('#2d2d2d');
//         this.add.text(20, 20, 'MODO PRUEBA: WASD PARA MOVER', { color: '#00ff00' });

//         // Creamos al jugador
//         this.player = new Player(this, 640, 360);
//     }

//     update() {
//         if (this.player) {
//             this.player.update(); // Sin esto, el controlador no lee las teclas
//         }
//     }
// }