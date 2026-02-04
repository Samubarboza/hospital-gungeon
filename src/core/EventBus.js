// sistema de eventos
class EventBus {
    constructor() {
        // registro donde cada nombre de evento guarda una lista de funciones a ejecutar.
        this.events = {};
    }
    // suscribe una funcion a un evento
    on(event, handler) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(handler);
    }
    // dispara evento - si no hay listeners no hace nada, si hay ejecuta el handler
    emit(event, payload = {}) {
        if (!this.events[event]) return;
        this.events[event].forEach(handler => handler(payload));
    }
    
    off(event, handler) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(h => h !== handler);
    }
}

export const eventBus = new EventBus();
