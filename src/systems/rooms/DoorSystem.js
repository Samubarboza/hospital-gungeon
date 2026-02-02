/**
 * DoorSystem.js - VERSIÓN TOP-DOWN MEJORADA
 * Mejoras:
 * - Puertas pegadas a los bordes de la sala
 * - Mejor visualización (sprite-like)
 * - Animación de apertura/cierre
 */

export class DoorSystem {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.doors = [];
    
    // Configuración visual
    this.doorThickness = 15;  // Grosor de la puerta
    this.doorLength = 80;     // Largo de la puerta
    this.animationProgress = 0; // Para animación de apertura
  }

  /**
   * Inicializa las puertas con mejor posicionamiento
   */
  initDoors(doorData) {
    this.doors = doorData.map(door => {
      const doorObj = {
        x: door.x,
        y: door.y,
        direction: door.direction,
        locked: door.locked,
        openAmount: door.locked ? 0 : 1 // 0 = cerrada, 1 = abierta
      };

      // Ajustar dimensiones según orientación
      if (door.direction === 'north' || door.direction === 'south') {
        doorObj.width = this.doorLength;
        doorObj.height = this.doorThickness;
      } else {
        doorObj.width = this.doorThickness;
        doorObj.height = this.doorLength;
      }

      return doorObj;
    });

    console.log(`[DoorSystem] ${this.doors.length} puertas inicializadas (top-down)`);
  }

  /**
   * Bloquea todas las puertas con animación
   */
  lockAllDoors() {
    this.doors.forEach(door => {
      door.locked = true;
      door.openAmount = 0;
    });
    
    console.log('[DoorSystem] 🔒 Puertas bloqueadas');
    this.eventBus.emit('doors:locked');
  }

  /**
   * Desbloquea todas las puertas con animación
   */
  unlockAllDoors() {
    this.doors.forEach(door => {
      door.locked = false;
      door.openAmount = 1;
    });
    
    console.log('[DoorSystem] 🚪 Puertas desbloqueadas');
    this.eventBus.emit('doors:unlocked');
  }

  /**
   * Actualiza animaciones de puertas
   */
  update(deltaTime = 0.016) {
    this.doors.forEach(door => {
      const targetOpen = door.locked ? 0 : 1;
      const speed = 3; // Velocidad de animación

      // Interpolar suavemente
      if (door.openAmount < targetOpen) {
        door.openAmount = Math.min(door.openAmount + speed * deltaTime, targetOpen);
      } else if (door.openAmount > targetOpen) {
        door.openAmount = Math.max(door.openAmount - speed * deltaTime, targetOpen);
      }
    });
  }

  /**
   * Verifica colisión con puertas (solo abiertas)
   * Incluye zona de activación más grande
   */
  checkDoorCollision(player) {
    for (let door of this.doors) {
      if (door.locked || door.openAmount < 0.8) continue;

      // Zona de activación extendida (más fácil pasar)
      const activationZone = {
        x: door.x - door.width / 2 - 10,
        y: door.y - door.height / 2 - 10,
        width: door.width + 20,
        height: door.height + 20
      };

      if (this._isColliding(player, activationZone)) {
        console.log(`[DoorSystem] ✅ Jugador atravesó puerta ${door.direction}`);
        return door;
      }
    }
    
    return null;
  }

  /**
   * Detección de colisión AABB mejorada
   */
  _isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }

  /**
   * Renderiza puertas estilo top-down
   */
  render(ctx) {
    this.doors.forEach(door => {
      const halfWidth = door.width / 2;
      const halfHeight = door.height / 2;

      // Color base según estado
      let baseColor, accentColor;
      if (door.locked) {
        baseColor = '#8B0000';    // Rojo oscuro
        accentColor = '#FF4444';  // Rojo claro
      } else {
        baseColor = '#0D4D0D';    // Verde oscuro
        accentColor = '#44FF44';  // Verde claro
      }

      // Dibujar marco de puerta (siempre visible)
      ctx.fillStyle = '#2c2c2c';
      ctx.fillRect(door.x - halfWidth - 5, door.y - halfHeight - 5, 
                   door.width + 10, door.height + 10);

      // Dibujar puerta con efecto de apertura
      if (door.openAmount < 1) {
        ctx.fillStyle = baseColor;
        
        if (door.direction === 'north' || door.direction === 'south') {
          // Puerta horizontal - se abre a los lados
          const openWidth = door.width * (1 - door.openAmount);
          ctx.fillRect(door.x - openWidth / 2, door.y - halfHeight, 
                       openWidth, door.height);
        } else {
          // Puerta vertical - se abre arriba/abajo
          const openHeight = door.height * (1 - door.openAmount);
          ctx.fillRect(door.x - halfWidth, door.y - openHeight / 2, 
                       door.width, openHeight);
        }

        // Borde brillante
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2;
        if (door.direction === 'north' || door.direction === 'south') {
          const openWidth = door.width * (1 - door.openAmount);
          ctx.strokeRect(door.x - openWidth / 2, door.y - halfHeight, 
                         openWidth, door.height);
        } else {
          const openHeight = door.height * (1 - door.openAmount);
          ctx.strokeRect(door.x - halfWidth, door.y - openHeight / 2, 
                         door.width, openHeight);
        }
      }

      // Indicador visual (emoji o símbolo)
      if (door.openAmount < 0.5) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔒', door.x, door.y);
      } else if (door.openAmount > 0.8) {
        // Flecha indicando dirección
        ctx.fillStyle = '#FFFF00';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const arrows = {
          'north': '↑',
          'south': '↓',
          'east': '→',
          'west': '←'
        };
        ctx.fillText(arrows[door.direction] || '●', door.x, door.y);
      }
    });
  }

  /**
   * Renderiza minimapa de puertas (opcional)
   */
  renderMinimap(ctx, minimapX, minimapY, minimapScale) {
    this.doors.forEach(door => {
      const x = minimapX + door.x * minimapScale;
      const y = minimapY + door.y * minimapScale;
      
      ctx.fillStyle = door.locked ? '#ff0000' : '#00ff00';
      ctx.fillRect(x - 2, y - 2, 4, 4);
    });
  }

  getDoors() {
    return this.doors;
  }

  areAllDoorsLocked() {
    return this.doors.every(door => door.locked);
  }

  clear() {
    this.doors = [];
    console.log('[DoorSystem] Puertas limpiadas');
  }
}