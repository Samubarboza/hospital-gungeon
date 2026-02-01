import { eventBus } from './EventBus.js';

class RunManager {
    constructor() {
        this.sectors = ['er', 'surgery', 'labs', 'psych', 'basement'];
        this.currentIndex = 0;
        this.active = false;
        
        this.bindEvents();
    }
    
    bindEvents() {
        eventBus.on('game:start', () => this.startRun());
        
        // Hub le pide al RunManager que continúe
        eventBus.on('hub:continue', () => this.continueFromHub());

        // Cuando un sector termina, volvemos al hub (la escena lo hace),
        // y la siguiente vez que el jugador presione ENTER en el hub, avanzamos.
        eventBus.on('sector:complete', () => this.onSectorComplete());

        // Boss derrotado -> ending
        eventBus.on('boss:defeated', () => this.finishRun());
    }
    
    startRun() {
        this.currentIndex = 0;
        this.active = true;
    }
    
    continueFromHub() {
        if (!this.active) return;

        // Si ya no quedan sectores, entra boss
        if (this.currentIndex >= this.sectors.length) {
            eventBus.emit('boss:enter', { boss: 'mirror' });
            return;
        }

        // Entra el sector actual
        const sector = this.sectors[this.currentIndex];
        eventBus.emit('sector:enter', { sector });
    }
    
    onSectorComplete() {
        if (!this.active) return;
        this.currentIndex += 1;
    }
    
    finishRun() {
        if (!this.active) return;
        this.active = false;
        eventBus.emit('ending:show', { ending: 'escape' });
    }
}

export const runManager = new RunManager();
