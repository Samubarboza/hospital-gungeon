/**
 * RoomTemplates-TopDown-4Salas.js
 * Define las 4 salas fijas del juego con progresión lineal
 */

export const ROOM_TEMPLATES = {
  starter: {
    name: "Sala Inicio",
    width: 800,
    height: 600,
    backgroundColor: '#1a1a2e',
    enemies: [
      { x: 380, y: 220, type: 'basic', hp: 30 },
      { x: 300, y: 360, type: 'basic', hp: 30 },
      { x: 500, y: 360, type: 'basic', hp: 30 }
    ],
    doors: [
      { 
        x: 775, 
        y: 300, 
        direction: 'right', 
        locked: false,
        leadsTo: 'next'  // Avanza a la siguiente sala
      }
    ],
    walls: [
      { x: 0, y: 0, width: 800, height: 20 },
      { x: 0, y: 580, width: 800, height: 20 },
      { x: 0, y: 0, width: 20, height: 600 },
      { x: 780, y: 0, width: 20, height: 275 },
      { x: 780, y: 325, width: 20, height: 275 }
    ],
    obstacles: [
      { x: 200, y: 200, width: 100, height: 100 },
      { x: 500, y: 300, width: 100, height: 100 }
    ]
  },

  easy: {
    name: "Sala Fácil",
    width: 800,
    height: 600,
    backgroundColor: '#162447',
    enemies: [
      { x: 400, y: 200, type: 'basic', hp: 30 },
      { x: 300, y: 400, type: 'basic', hp: 30 }
    ],
    doors: [
      { 
        x: 25, 
        y: 300, 
        direction: 'left', 
        locked: true,
        leadsTo: 'prev'  // Retrocede a la sala anterior
      },
      { 
        x: 775, 
        y: 300, 
        direction: 'right', 
        locked: true,
        leadsTo: 'next'  // Avanza a la siguiente sala
      }
    ],
    walls: [
      { x: 0, y: 0, width: 800, height: 20 },
      { x: 0, y: 580, width: 800, height: 20 },
      { x: 0, y: 0, width: 20, height: 275 },
      { x: 0, y: 325, width: 20, height: 275 },
      { x: 780, y: 0, width: 20, height: 275 },
      { x: 780, y: 325, width: 20, height: 275 }
    ],
    obstacles: [
      { x: 150, y: 150, width: 80, height: 80 },
      { x: 550, y: 350, width: 80, height: 80 }
    ]
  },

  medium: {
    name: "Sala Intermedia",
    width: 800,
    height: 600,
    backgroundColor: '#1f4068',
    enemies: [
      { x: 400, y: 200, type: 'fast', hp: 40 },
      { x: 300, y: 400, type: 'basic', hp: 30 },
      { x: 500, y: 300, type: 'basic', hp: 30 }
    ],
    doors: [
      { 
        x: 25, 
        y: 300, 
        direction: 'left', 
        locked: true,
        leadsTo: 'prev'  // Retrocede a la sala anterior
      },
      { 
        x: 775, 
        y: 300, 
        direction: 'right', 
        locked: true,
        leadsTo: 'next'  // Avanza a la siguiente sala
      }
    ],
    walls: [
      { x: 0, y: 0, width: 800, height: 20 },
      { x: 0, y: 580, width: 800, height: 20 },
      { x: 0, y: 0, width: 20, height: 275 },
      { x: 0, y: 325, width: 20, height: 275 },
      { x: 780, y: 0, width: 20, height: 275 },
      { x: 780, y: 325, width: 20, height: 275 }
    ],
    obstacles: [
      { x: 200, y: 100, width: 60, height: 60 },
      { x: 400, y: 450, width: 60, height: 60 },
      { x: 600, y: 250, width: 60, height: 60 }
    ]
  },

  boss: {
    name: "Sala BOSS",
    width: 800,
    height: 600,
    backgroundColor: '#8b0000',
    enemies: [
      { x: 400, y: 300, type: 'boss', hp: 150 }
    ],
    doors: [
      { 
        x: 25, 
        y: 300, 
        direction: 'left', 
        locked: true,
        leadsTo: 'prev'  // Retrocede a la sala anterior
      }
      // No hay puerta de avance (es la última sala)
    ],
    walls: [
      { x: 0, y: 0, width: 800, height: 20 },
      { x: 0, y: 580, width: 800, height: 20 },
      { x: 0, y: 0, width: 20, height: 275 },
      { x: 0, y: 325, width: 20, height: 275 },
      { x: 780, y: 0, width: 20, height: 600 }
    ],
    obstacles: [
      { x: 100, y: 100, width: 100, height: 100 },
      { x: 600, y: 100, width: 100, height: 100 },
      { x: 100, y: 400, width: 100, height: 100 },
      { x: 600, y: 400, width: 100, height: 100 }
    ]
  }
};
