

import { DoorSystem } from './DoorSystem.js';
import { RoomLoader } from './RoomLoader.js';
import { ROOM_TEMPLATES } from './RoomTemplates.js';

/**
 * EventBus aislado solo para el sistema de salas
 */
class RoomEventBus {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }

  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
}

/**
 * RoomSystemManager - Gestor AISLADO del sistema de salas
 */
export class RoomSystemManager {
  constructor(canvas, externalReferences = {}) {
    this.externalRefs = {
      player: externalReferences.player || this._createDummyPlayer(),
      enemies: externalReferences.enemies || [],
      bullets: externalReferences.bullets || [],
      walls: externalReferences.walls || [],
      obstacles: externalReferences.obstacles || []
    };

    this.canvas = canvas;


    this.eventBus = new RoomEventBus();

    this.ROOM_TEMPLATES = ROOM_TEMPLATES;

    this.doorSystem = new DoorSystem(this.eventBus);
    this.roomLoader = new RoomLoader(this, this.eventBus);

  
    this.mapImage = null;
    this.mapImagePath = null;

    this._setupInternalEvents();
  }

  /**
   * @private
   */
  _createDummyPlayer() {
    return {
      x: 50,
      y: 300,
      width: 30,
      height: 30
    };
  }

  /**
   * @private
   */
  _setupInternalEvents() {
    this.eventBus.on('room:cleared', () => {
      this.doorSystem.unlockForwardDoors();
    });

    this.eventBus.on('door:entered', (data) => {
      this.roomLoader.handleDoorEntry(data.door);
    });
  }

  get player() {
    return this.externalRefs.player;
  }

  set player(value) {
    this.externalRefs.player = value;
  }

  get enemies() {
    return this.externalRefs.enemies;
  }

  set enemies(value) {
    this.externalRefs.enemies = value;
  }

  get bullets() {
    return this.externalRefs.bullets;
  }

  set bullets(value) {
    this.externalRefs.bullets = value;
  }

  get walls() {
    return this.externalRefs.walls;
  }

  set walls(value) {
    this.externalRefs.walls = value;
  }

  get obstacles() {
    return this.externalRefs.obstacles;
  }

  set obstacles(value) {
    this.externalRefs.obstacles = value;
  }



  start() {
    this.roomLoader.loadFirstRoom();
  }

  /**
   * Reiniciar el sistema
   */
  restart() {
    this.roomLoader.loadFirstRoom();
  }

  /**
   * Marcar sala actual como completada
   */
  clearCurrentRoom() {
    this.externalRefs.enemies = [];
    this.roomLoader.markCurrentRoomAsCleared();
    this.eventBus.emit('room:cleared');
  }

  goToNextRoom() {
    this.roomLoader.nextRoom();
  }

  goToPreviousRoom() {
    this.roomLoader.previousRoom();
  }


  getRoomInfo() {
    return {
      name: this.roomLoader.getCurrentRoomName(),
      progress: this.roomLoader.getRoomProgress(),
      isCleared: this.roomLoader.isCurrentRoomCleared(),
      clearedRooms: this.roomLoader.getClearedRoomsInfo(),
      enemiesCount: this.externalRefs.enemies.length
    };
  }

  getDoors() {
    return this.doorSystem.getDoors();
  }


  lockAllDoors() {
    this.doorSystem.lockAllDoors();
  }

  unlockAllDoors() {
    this.doorSystem.unlockAllDoors();
  }

  unlockForwardDoors() {
    this.doorSystem.unlockForwardDoors();
  }


  loadMapImage(imagePath) {
    return new Promise((resolve, reject) => {
      this.mapImage = new Image();
      this.mapImagePath = imagePath;
      
      this.mapImage.onload = () => {
        console.log('[RoomSystem] Imagen del mapa cargada:', imagePath);
        resolve(this.mapImage);
      };
      
      this.mapImage.onerror = () => {
        console.error('[RoomSystem] Error al cargar imagen del mapa:', imagePath);
        reject(new Error(`No se pudo cargar la imagen: ${imagePath}`));
      };
      
      this.mapImage.src = imagePath;
    });
  }

  getMapImage() {
    return this.mapImage;
  }

  /**
   * Conectar con un sistema de jugador externo
   */
  connectPlayer(playerReference) {
    this.externalRefs.player = playerReference;
  }

  connectEnemies(enemiesArrayReference) {
    this.externalRefs.enemies = enemiesArrayReference;
  }

  connectBullets(bulletsArrayReference) {
    this.externalRefs.bullets = bulletsArrayReference;
  }

  onRoomLoaded(callback) {
    this.eventBus.on('room:loaded', callback);
  }

  onRoomCleared(callback) {
    this.eventBus.on('room:cleared', callback);
  }

  onGameCompleted(callback) {
    this.eventBus.on('game:completed', callback);
  }

  onDoorEntered(callback) {
    this.eventBus.on('door:entered', callback);
  }
}