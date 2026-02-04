/**
 * DoorSystem.js 
 * Modificado para ser compatible con la llamada de SectorScene.js
 */
export class DoorSystem {
    constructor(eventBus) {
        // SectorScene solo pasa el eventBus, así que guardamos eso.
        this.eventBus = eventBus;
        this.scene = null; 
        this.graphics = null;
        
        this.doors = [];
        this.doorThickness = 20;
        this.doorLength = 100;
    }

    /**
     * Método nuevo para recibir la escena desde el RoomLoader
     */
    setScene(scene) {
        if (!this.scene) {
            this.scene = scene;
            this.graphics = this.scene.add.graphics();
            this.graphics.setDepth(10);
        }
    }

    initDoors(doorData) {
        if (!doorData) return;
        this.doors = doorData.map(door => {
            const length = door.width || this.doorLength;
            return {
                x: door.x,
                y: door.y,
                direction: door.direction,
                locked: door.locked !== undefined ? door.locked : true,
                openAmount: door.locked ? 0 : 1,
                leadsTo: door.leadsTo,
                width: (door.direction === 'north' || door.direction === 'south') ? length : this.doorThickness,
                height: (door.direction === 'north' || door.direction === 'south') ? this.doorThickness : length
            };
        });
    }

    lockAllDoors() {
        this.doors.forEach(d => d.locked = true);
    }

    unlockAllDoors() {
        this.doors.forEach(d => d.locked = false);
    }

    update(deltaTime = 0.016) {
        if (!this.scene || !this.graphics || this.doors.length === 0) return;

        this.doors.forEach(door => {
            const target = door.locked ? 0 : 1;
            const speed = 3;
            if (door.openAmount < target) door.openAmount = Math.min(door.openAmount + speed * deltaTime, target);
            else if (door.openAmount > target) door.openAmount = Math.max(door.openAmount - speed * deltaTime, target);
        });

        this.drawDoors();
    }

    drawDoors() {
        this.graphics.clear();
        this.doors.forEach(door => {
            const color = door.locked ? 0x8B0000 : 0x5da688;
            this.graphics.fillStyle(color, 1);
            
            if (door.direction === 'north' || door.direction === 'south') {
                const leafW = (door.width * (1 - (door.openAmount * 0.9))) / 2;
                this.graphics.fillRect(door.x - door.width / 2, door.y - door.height / 2, leafW, door.height);
                this.graphics.fillRect(door.x + door.width / 2 - leafW, door.y - door.height / 2, leafW, door.height);
            } else {
                const leafH = door.height * (1 - door.openAmount);
                this.graphics.fillRect(door.x - door.width / 2, door.y - door.height / 2, door.width, leafH);
            }
        });
    }
}