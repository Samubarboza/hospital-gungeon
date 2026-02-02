/**
 * RoomTemplates.js - VERSIÓN TOP-DOWN MEJORADA
 * Incluye:
 * - Paredes para colisión
 * - Mejores posiciones de puertas en los bordes
 * - Layouts más parecidos a The Binding of Isaac / Enter the Gungeon
 */

export const RoomTemplates = {
  // ===== SALA INICIAL =====
  starter: {
    id: 'starter',
    width: 800,
    height: 600,
    
    // Sin enemigos al inicio
    enemies: [],
    
    // Solo puerta superior para avanzar
    doors: [
      { x: 400, y: 20, direction: 'north', locked: false }
    ],
    
    // Paredes (obstáculos rectangulares)
    walls: [
      // Pilares decorativos
      { x: 200, y: 200, width: 60, height: 60 },
      { x: 540, y: 200, width: 60, height: 60 },
      { x: 200, y: 340, width: 60, height: 60 },
      { x: 540, y: 340, width: 60, height: 60 }
    ]
  },

  // ===== SALA SIMPLE =====
  simple: {
    id: 'simple',
    width: 800,
    height: 600,
    
    // 3 enemigos en formación triangular
    enemies: [
      { x: 400, y: 200, type: 'basic' },
      { x: 300, y: 400, type: 'basic' },
      { x: 500, y: 400, type: 'basic' }
    ],
    
    // Puertas en lados opuestos
    doors: [
      { x: 400, y: 20, direction: 'north', locked: true },
      { x: 400, y: 580, direction: 'south', locked: true }
    ],
    
    // Muro central horizontal
    walls: [
      { x: 250, y: 290, width: 120, height: 20 },
      { x: 430, y: 290, width: 120, height: 20 }
    ]
  },

  // ===== SALA MEDIANA =====
  medium: {
    id: 'medium',
    width: 800,
    height: 600,
    
    // 5 enemigos en patrón de cruz
    enemies: [
      { x: 400, y: 300, type: 'basic' }, // Centro
      { x: 250, y: 300, type: 'basic' }, // Izquierda
      { x: 550, y: 300, type: 'basic' }, // Derecha
      { x: 400, y: 180, type: 'basic' }, // Arriba
      { x: 400, y: 420, type: 'basic' }  // Abajo
    ],
    
    // 3 puertas: arriba, abajo, izquierda
    doors: [
      { x: 400, y: 20, direction: 'north', locked: true },
      { x: 400, y: 580, direction: 'south', locked: true },
      { x: 20, y: 300, direction: 'west', locked: true }
    ],
    
    // Pilares en las esquinas
    walls: [
      { x: 100, y: 100, width: 80, height: 80 },
      { x: 620, y: 100, width: 80, height: 80 },
      { x: 100, y: 420, width: 80, height: 80 },
      { x: 620, y: 420, width: 80, height: 80 }
    ]
  },

  // ===== SALA DIFÍCIL =====
  hard: {
    id: 'hard',
    width: 800,
    height: 600,
    
    // 8 enemigos en patrón de grid
    enemies: [
      { x: 200, y: 150, type: 'basic' },
      { x: 400, y: 150, type: 'basic' },
      { x: 600, y: 150, type: 'basic' },
      { x: 200, y: 300, type: 'basic' },
      { x: 600, y: 300, type: 'basic' },
      { x: 200, y: 450, type: 'basic' },
      { x: 400, y: 450, type: 'basic' },
      { x: 600, y: 450, type: 'basic' }
    ],
    
    // 4 puertas (todas las direcciones)
    doors: [
      { x: 400, y: 20, direction: 'north', locked: true },
      { x: 400, y: 580, direction: 'south', locked: true },
      { x: 20, y: 300, direction: 'west', locked: true },
      { x: 780, y: 300, direction: 'east', locked: true }
    ],
    
    // Laberinto simple
    walls: [
      // Muro superior
      { x: 150, y: 100, width: 200, height: 30 },
      { x: 450, y: 100, width: 200, height: 30 },
      
      // Muro central
      { x: 300, y: 285, width: 30, height: 30 },
      { x: 470, y: 285, width: 30, height: 30 },
      
      // Muro inferior
      { x: 150, y: 470, width: 200, height: 30 },
      { x: 450, y: 470, width: 200, height: 30 }
    ]
  },

  // ===== SALA BOSS =====
  boss: {
    id: 'boss',
    width: 800,
    height: 600,
    
    // Un solo jefe en el centro
    enemies: [
      { x: 400, y: 300, type: 'boss' }
    ],
    
    // Solo puerta de salida (abajo)
    doors: [
      { x: 400, y: 580, direction: 'south', locked: true }
    ],
    
    // Arena vacía (sin obstáculos)
    walls: []
  },

  // ===== NUEVA: SALA CORREDOR =====
  corridor: {
    id: 'corridor',
    width: 800,
    height: 600,
    
    // Enemigos en línea
    enemies: [
      { x: 400, y: 200, type: 'basic' },
      { x: 400, y: 300, type: 'basic' },
      { x: 400, y: 400, type: 'basic' }
    ],
    
    doors: [
      { x: 400, y: 20, direction: 'north', locked: true },
      { x: 400, y: 580, direction: 'south', locked: true }
    ],
    
    // Paredes laterales creando pasillo
    walls: [
      // Izquierda
      { x: 200, y: 0, width: 40, height: 200 },
      { x: 200, y: 400, width: 40, height: 200 },
      
      // Derecha
      { x: 560, y: 0, width: 40, height: 200 },
      { x: 560, y: 400, width: 40, height: 200 }
    ]
  },

  // ===== NUEVA: SALA EMBOSCADA =====
  ambush: {
    id: 'ambush',
    width: 800,
    height: 600,
    
    // Enemigos alrededor del perímetro
    enemies: [
      { x: 200, y: 100, type: 'basic' },
      { x: 600, y: 100, type: 'basic' },
      { x: 100, y: 300, type: 'basic' },
      { x: 700, y: 300, type: 'basic' },
      { x: 200, y: 500, type: 'basic' },
      { x: 600, y: 500, type: 'basic' }
    ],
    
    doors: [
      { x: 400, y: 20, direction: 'north', locked: true },
      { x: 20, y: 300, direction: 'west', locked: true },
      { x: 780, y: 300, direction: 'east', locked: true }
    ],
    
    // Muro central grande (refugio)
    walls: [
      { x: 350, y: 250, width: 100, height: 100 }
    ]
  }
};

/**
 * Obtiene un template aleatorio (excluye starter y boss)
 */
export function getRandomRoomTemplate() {
  const templates = ['simple', 'medium', 'hard', 'corridor', 'ambush'];
  const randomIndex = Math.floor(Math.random() * templates.length);
  return RoomTemplates[templates[randomIndex]];
}

/**
 * Obtiene un template específico
 */
export function getRoomTemplate(templateId) {
  return RoomTemplates[templateId] || RoomTemplates.simple;
}

/**
 * NUEVA: Verifica colisión con paredes
 * Útil para el sistema de movimiento del jugador
 */
export function checkWallCollision(entity, walls) {
  for (let wall of walls) {
    if (
      entity.x < wall.x + wall.width &&
      entity.x + entity.width > wall.x &&
      entity.y < wall.y + wall.height &&
      entity.y + entity.height > wall.y
    ) {
      return wall; // Hay colisión
    }
  }
  return null; // Sin colisión
}