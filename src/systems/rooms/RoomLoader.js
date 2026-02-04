import { ROOM_TEMPLATES } from './RoomTemplates.js';

export class RoomLoader {
    constructor(scene, eventBus) {
        this.scene = scene;
        this.eventBus = eventBus;
        this.roomSequence = ['starter']; // Debe coincidir con la clave en RoomTemplates
        this.currentRoomIndex = 0;
        
        // REPARACIÓN: Le pasamos la escena al DoorSystem que SectorScene creó incompleto
        if (this.scene.doorSystem) {
            this.scene.doorSystem.setScene(this.scene);
        }
    }

    loadRoomByIndex(index) {
        const roomId = this.roomSequence[index];
        const template = ROOM_TEMPLATES[roomId];
        
        if (!template) return;

        // Cargar imagen de fondo si no existe
        this.scene.add.image(template.width / 2, template.height / 2, template.backgroundImage)
            .setDisplaySize(template.width, template.height)
            .setDepth(-10);

        // Limpiar y cargar lógica
        this.scene.enemies = [];
        this.scene.walls = [];
        this.scene.obstacles = [];

        template.walls.forEach(w => this.scene.walls.push({ ...w }));
        template.obstacles.forEach(o => this.scene.obstacles.push({ ...o }));

        // Inicializar puertas
        if (this.scene.doorSystem) {
            this.scene.doorSystem.initDoors(template.doors);
        }

        // Colocar al jugador
        if (this.scene.player) {
            this.scene.player.x = template.width / 2;
            this.scene.player.y = template.height - 100;
        }
    }
}