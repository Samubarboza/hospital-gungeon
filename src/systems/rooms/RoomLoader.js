/**
 * RoomLoader.js
 * Sistema principal que coordina:
 * - Carga de salas desde templates
 * - Spawneo de enemigos
 * - Control de puertas (bloqueo/desbloqueo)
 * - Flujo de la sala (entrada -> combate -> salida)
 */

import { getRoomTemplate, getRandomRoomTemplate } from './RoomTemplates.js';
import { DoorSystem } from './DoorSystem.js';

export class RoomLoader {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.doorSystem = new DoorSystem(eventBus);
    
    this.currentRoom = null;
    this.enemiesInRoom = [];
    this.roomCleared = false;

    // Suscribirse a eventos
    this._setupEventListeners();
  }

  /**
   * Configura los listeners de eventos
   * @private
   */
  _setupEventListeners() {
    // Cuando un enemigo muere, verificar si la sala está limpia
    this.eventBus.on('enemy:died', () => {
      this._checkRoomCleared();
    });
  }

  /**
   * Carga una sala específica por ID de template
   * @param {string} templateId - ID del template ('starter', 'simple', etc.)
   */
  loadRoom(templateId) {
    const template = getRoomTemplate(templateId);
    this._initializeRoom(template);
  }

  /**
   * Carga una sala aleatoria
   */
  loadRandomRoom() {
    const template = getRandomRoomTemplate();
    this._initializeRoom(template);
  }

  /**
   * Inicializa una sala con su template
   * @private
   */
  _initializeRoom(template) {
    console.log(`[RoomLoader] Cargando sala: ${template.id}`);
    
    // Guardar referencia a la sala actual
    this.currentRoom = { ...template };
    this.roomCleared = false;

    // Inicializar puertas
    this.doorSystem.initDoors(template.doors);

    // Si hay enemigos, bloquear puertas
    if (template.enemies.length > 0) {
      this.doorSystem.lockAllDoors();
      console.log(`[RoomLoader] Sala con ${template.enemies.length} enemigos - Puertas bloqueadas`);
    } else {
      // Si no hay enemigos, dejar puertas abiertas
      this.doorSystem.unlockAllDoors();
      console.log('[RoomLoader] Sala sin enemigos - Puertas abiertas');
      this.roomCleared = true;
    }

    // Emitir evento de sala cargada con datos de enemigos
    this.eventBus.emit('room:loaded', {
      roomId: template.id,
      enemies: template.enemies,
      width: template.width,
      height: template.height
    });

    // Guardar enemigos en la sala (serán usados para tracking)
    this.enemiesInRoom = [...template.enemies];
  }

  /**
   * Verifica si quedan enemigos en la sala
   * Si no quedan, desbloquea las puertas
   * @private
   */
  _checkRoomCleared() {
    // Decrementar contador de enemigos
    this.enemiesInRoom.pop();

    console.log(`[RoomLoader] Enemigos restantes: ${this.enemiesInRoom.length}`);

    // Si no quedan enemigos y la sala no estaba limpia
    if (this.enemiesInRoom.length === 0 && !this.roomCleared) {
      this._onRoomCleared();
    }
  }

  /**
   * Se ejecuta cuando la sala se limpia de enemigos
   * @private
   */
  _onRoomCleared() {
    console.log('[RoomLoader] ¡Sala limpia! Desbloqueando puertas...');
    
    this.roomCleared = true;
    this.doorSystem.unlockAllDoors();
    
    this.eventBus.emit('room:cleared', {
      roomId: this.currentRoom.id
    });
  }

  /**
   * Actualiza el sistema (llamar en el game loop)
   * Verifica colisiones con puertas
   * @param {Object} player - Objeto del jugador
   */
  update(player) {
    // Verificar si el jugador toca una puerta desbloqueada
    const doorTouched = this.doorSystem.checkDoorCollision(player);
    
    if (doorTouched) {
      this._onPlayerPassedDoor(doorTouched);
    }
  }

  /**
   * Se ejecuta cuando el jugador pasa por una puerta
   * @private
   */
  _onPlayerPassedDoor(door) {
    console.log(`[RoomLoader] Jugador pasó por puerta ${door.direction}`);
    
    // Emitir evento con la dirección de la puerta
    this.eventBus.emit('player:changedRoom', {
      direction: door.direction,
      fromRoom: this.currentRoom.id
    });

    // Cargar nueva sala aleatoria
    this.loadRandomRoom();
  }

  /**
   * Renderiza el sistema (puertas)
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx) {
    this.doorSystem.render(ctx);
  }

  /**
   * Obtiene información de la sala actual
   * @returns {Object}
   */
  getCurrentRoomInfo() {
    return {
      roomId: this.currentRoom?.id || null,
      enemiesCount: this.enemiesInRoom.length,
      isCleared: this.roomCleared,
      doors: this.doorSystem.getDoors()
    };
  }

  /**
   * Reinicia el sistema (para reiniciar el juego)
   */
  reset() {
    this.currentRoom = null;
    this.enemiesInRoom = [];
    this.roomCleared = false;
    this.doorSystem.clear();
    console.log('[RoomLoader] Sistema reiniciado');
  }
}