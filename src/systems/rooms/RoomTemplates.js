/**
 * RoomTemplates-TopDown-4Salas.js
 * Define las 4 salas fijas del juego con progresión lineal
 * Sincronizado con test-systemroom.html -> AHORA ESCALADO A 1280x720
 */

export const ROOM_TEMPLATES = {
  starter: {
    name: "🏠 Sala Inicio",
    width: 1280,
    height: 720,
    backgroundColor: '#1a1a2e',
    enemies: [],
    doors: [
      { x: 1255, y: 360, direction: 'right', locked: false, leadsTo: 'next' }
    ],
    walls: [
      { x: 0, y: 0, width: 1280, height: 20 },      // Top
      { x: 0, y: 700, width: 1280, height: 20 },    // Bottom
      { x: 0, y: 0, width: 20, height: 720 },       // Left
      { x: 1260, y: 0, width: 20, height: 320 },    // Right Top
      { x: 1260, y: 400, width: 20, height: 320 }   // Right Bottom
    ],
    obstacles: [
      { x: 300, y: 200, width: 120, height: 120 },
      { x: 800, y: 400, width: 120, height: 120 }
    ]
  },

  easy: {
    name: "⚔️ Sala Fácil",
    width: 1280,
    height: 720,
    backgroundColor: '#162447',
    enemies: [
      { x: 600, y: 300, type: 'basic', hp: 30 },
      { x: 800, y: 500, type: 'basic', hp: 30 }
    ],
    doors: [
      { x: 25, y: 360, direction: 'left', locked: true, leadsTo: 'prev' },
      { x: 1255, y: 360, direction: 'right', locked: true, leadsTo: 'next' }
    ],
    walls: [
      { x: 0, y: 0, width: 1280, height: 20 },
      { x: 0, y: 700, width: 1280, height: 20 },
      { x: 0, y: 0, width: 20, height: 320 },
      { x: 0, y: 400, width: 20, height: 320 },
      { x: 1260, y: 0, width: 20, height: 320 },
      { x: 1260, y: 400, width: 20, height: 320 }
    ],
    obstacles: [
      { x: 300, y: 200, width: 100, height: 100 },
      { x: 900, y: 450, width: 100, height: 100 }
    ]
  },

  medium: {
    name: "⚡ Sala Intermedia",
    width: 1280,
    height: 720,
    backgroundColor: '#1f4068',
    enemies: [
      { x: 600, y: 250, type: 'fast', hp: 40 },
      { x: 400, y: 500, type: 'basic', hp: 30 },
      { x: 900, y: 350, type: 'basic', hp: 30 }
    ],
    doors: [
      { x: 25, y: 360, direction: 'left', locked: true, leadsTo: 'prev' },
      { x: 1255, y: 360, direction: 'right', locked: true, leadsTo: 'next' }
    ],
    walls: [
      { x: 0, y: 0, width: 1280, height: 20 },
      { x: 0, y: 700, width: 1280, height: 20 },
      { x: 0, y: 0, width: 20, height: 320 },
      { x: 0, y: 400, width: 20, height: 320 },
      { x: 1260, y: 0, width: 20, height: 320 },
      { x: 1260, y: 400, width: 20, height: 320 }
    ],
    obstacles: [
      { x: 300, y: 150, width: 80, height: 80 },
      { x: 600, y: 500, width: 80, height: 80 },
      { x: 900, y: 300, width: 80, height: 80 }
    ]
  },

  boss: {
    name: "💀 Sala BOSS",
    width: 1280,
    height: 720,
    backgroundColor: '#8b0000',
    enemies: [
      { x: 640, y: 360, type: 'boss', hp: 150 }
    ],
    doors: [
      { x: 25, y: 360, direction: 'left', locked: true, leadsTo: 'prev' }
    ],
    walls: [
      { x: 0, y: 0, width: 1280, height: 20 },
      { x: 0, y: 700, width: 1280, height: 20 },
      { x: 0, y: 0, width: 20, height: 320 },
      { x: 0, y: 400, width: 20, height: 320 },
      { x: 1260, y: 0, width: 20, height: 720 }
    ],
    obstacles: [
      { x: 200, y: 150, width: 120, height: 120 },
      { x: 960, y: 150, width: 120, height: 120 },
      { x: 200, y: 450, width: 120, height: 120 },
      { x: 960, y: 450, width: 120, height: 120 }
    ]
  }
};
