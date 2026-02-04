/**
 * RoomTemplates.js
 * Proporciona los datos de la sala de hospital.
 */
export const ROOM_TEMPLATES = {
    // SectorScene busca 'starter' por defecto según la secuencia del loader
    starter: {
        name: "Sala de Hospital Abandonada",
        width: 800,
        height: 800,
        backgroundImage: 'mapa_hospital', // Asegúrate que este nombre esté en tu preload
        backgroundColor: '#1a1a1d',
        enemies: [
            { x: 400, y: 400, type: 'basic', hp: 30 }
        ],
        doors: [
            { x: 400, y: 20, direction: 'north', width: 120, locked: true, leadsTo: 'next' },
            { x: 400, y: 780, direction: 'south', width: 120, locked: true, leadsTo: 'prev' }
        ],
        walls: [
            { x: 0, y: 0, width: 20, height: 800 },
            { x: 780, y: 0, width: 20, height: 800 },
            { x: 0, y: 0, width: 340, height: 20 },
            { x: 460, y: 0, width: 340, height: 20 },
            { x: 0, y: 780, width: 340, height: 20 },
            { x: 460, y: 780, width: 340, height: 20 }
        ],
        obstacles: [
            { x: 100, y: 100, width: 100, height: 160 }, // Cama Arriba-Izq
            { x: 600, y: 100, width: 100, height: 160 }, // Cama Arriba-Der
            { x: 100, y: 540, width: 100, height: 160 }, // Cama Abajo-Izq
            { x: 600, y: 540, width: 100, height: 160 }  // Cama Abajo-Der
        ]
    }
};

// Hacemos que ROOM_TEMPLATES sea global para que SectorScene.js pueda leerlo en la línea 60
window.ROOM_TEMPLATES = ROOM_TEMPLATES;