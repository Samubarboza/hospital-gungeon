/**
 * RoomLoader-TopDown-4Salas.js
 * Sistema de carga de salas lineal con 4 salas fijas
 * Permite avanzar y retroceder (sin enemigos al volver)
 */

export class RoomLoader {
  constructor(game, eventBus) {
    this.game = game;
    this.eventBus = eventBus;
    this.roomSequence = ['starter', 'easy', 'medium', 'boss'];
    this.currentRoomIndex = 0;
    this.clearedRooms = new Set(); // Guarda qué salas ya fueron completadas
  }

  /**
   * Carga la primera sala (inicio del juego)
   */
  loadFirstRoom() {
    this.currentRoomIndex = 0;
    this.clearedRooms.clear();
    this.loadRoomByIndex(0);
  }

  /**
   * Carga una sala específica por índice
   */
  loadRoomByIndex(index, playerStartSide = 'left') {
    const roomId = this.roomSequence[index];
    const template = this.game.ROOM_TEMPLATES[roomId];
    
    if (!template) {
      console.error(`[RoomLoader] Template no encontrado: ${roomId}`);
      return;
    }

    console.log(`[RoomLoader] Cargando sala: ${template.name} (${index + 1}/${this.roomSequence.length})`);

    // Limpiar estado anterior
    this.game.enemies = [];
    this.game.bullets = [];
    this.game.walls = [];
    this.game.obstacles = [];

    // Configurar sala
    this.game.canvas.width = template.width;
    this.game.canvas.height = template.height;
    this.game.canvas.style.background = template.backgroundColor;

    // Crear enemigos SOLO si la sala NO ha sido completada
    const isCleared = this.clearedRooms.has(roomId);
    
    if (!isCleared && template.enemies.length > 0) {
      console.log(`[RoomLoader] Sala con ${template.enemies.length} enemigos (primera vez)`);
      template.enemies.forEach(enemyData => {
        const enemy = {
          x: enemyData.x,
          y: enemyData.y,
          width: enemyData.type === 'boss' ? 50 : 30,
          height: enemyData.type === 'boss' ? 50 : 30,
          hp: enemyData.hp,
          maxHp: enemyData.hp,
          speed: enemyData.type === 'fast' ? 1.5 : enemyData.type === 'boss' ? 0.8 : 1,
          type: enemyData.type || 'basic',
          color: enemyData.type === 'boss' ? '#ff0000' : enemyData.type === 'fast' ? '#ff9900' : '#ff4444'
        };
        this.game.enemies.push(enemy);
      });
    } else if (isCleared) {
      console.log(`[RoomLoader] Sala ya completada - Sin enemigos`);
    }

    // Crear paredes
    template.walls.forEach(wall => {
      this.game.walls.push({ ...wall });
    });

    // Crear obstáculos
    template.obstacles.forEach(obs => {
      this.game.obstacles.push({ ...obs });
    });

    // Inicializar puertas
    this.game.doorSystem.initDoors(template.doors);

    // Bloquear puertas SOLO si hay enemigos
    if (this.game.enemies.length > 0) {
      this.game.doorSystem.lockAllDoors();
      console.log(`[RoomLoader] Puertas bloqueadas (hay ${this.game.enemies.length} enemigos)`);
    } else {
      // Si no hay enemigos, desbloquear todas las puertas
      this.game.doorSystem.unlockAllDoors();
      console.log(`[RoomLoader] Puertas desbloqueadas (sin enemigos)`);
    }

    // Posicionar jugador según de dónde viene
    if (playerStartSide === 'left') {
      this.game.player.x = 50;
      this.game.player.y = 300;
    } else if (playerStartSide === 'right') {
      this.game.player.x = template.width - 80;
      this.game.player.y = 300;
    }

    // Emitir evento de sala cargada
    this.eventBus.emit('room:loaded', {
      roomId,
      roomName: template.name,
      index: index + 1,
      total: this.roomSequence.length,
      isCleared
    });
  }

  /**
   * Maneja la entrada a una puerta
   */
  handleDoorEntry(door) {
    console.log(`[RoomLoader] Puerta activada: ${door.direction} → ${door.leadsTo}`);

    if (door.leadsTo === 'next') {
      this.nextRoom();
    } else if (door.leadsTo === 'prev') {
      this.previousRoom();
    }
  }

  /**
   * Avanza a la siguiente sala
   */
  nextRoom() {
    // Marcar sala actual como completada
    const currentRoomId = this.roomSequence[this.currentRoomIndex];
    this.clearedRooms.add(currentRoomId);
    console.log(`[RoomLoader] Sala "${currentRoomId}" marcada como completada`);

    this.currentRoomIndex++;
    
    // Si llegamos a la sala del boss y la completamos, el juego termina
    if (this.currentRoomIndex >= this.roomSequence.length) {
      console.log(`[RoomLoader] ¡Juego completado!`);
      this.eventBus.emit('game:completed');
      return;
    }

    // Cargar siguiente sala (jugador aparece en el lado izquierdo)
    this.loadRoomByIndex(this.currentRoomIndex, 'left');
  }

  /**
   * Retrocede a la sala anterior
   */
  previousRoom() {
    if (this.currentRoomIndex <= 0) {
      console.log(`[RoomLoader] Ya estás en la primera sala`);
      return;
    }

    this.currentRoomIndex--;
    console.log(`[RoomLoader] Retrocediendo a sala ${this.currentRoomIndex + 1}`);

    // Cargar sala anterior (jugador aparece en el lado derecho)
    this.loadRoomByIndex(this.currentRoomIndex, 'right');
  }

  /**
   * Marca la sala actual como completada (cuando se eliminan todos los enemigos)
   */
  markCurrentRoomAsCleared() {
    const currentRoomId = this.roomSequence[this.currentRoomIndex];
    this.clearedRooms.add(currentRoomId);
    console.log(`[RoomLoader] ✅ Sala "${currentRoomId}" completada`);

    // Si completamos la sala del boss, terminar el juego
    if (currentRoomId === 'boss') {
      console.log(`[RoomLoader] 🎉 ¡BOSS DERROTADO! Juego completado`);
      this.eventBus.emit('game:completed');
    }
  }

  /**
   * Obtiene el nombre de la sala actual
   */
  getCurrentRoomName() {
    const roomId = this.roomSequence[this.currentRoomIndex];
    return this.game.ROOM_TEMPLATES[roomId]?.name || 'Desconocida';
  }

  /**
   * Obtiene el progreso actual del juego
   */
  getRoomProgress() {
    return {
      current: this.currentRoomIndex + 1,
      total: this.roomSequence.length
    };
  }

  /**
   * Verifica si la sala actual ya fue completada
   */
  isCurrentRoomCleared() {
    const currentRoomId = this.roomSequence[this.currentRoomIndex];
    return this.clearedRooms.has(currentRoomId);
  }

  /**
   * Obtiene información sobre las salas completadas
   */
  getClearedRoomsInfo() {
    return {
      total: this.clearedRooms.size,
      rooms: Array.from(this.clearedRooms)
    };
  }
}
