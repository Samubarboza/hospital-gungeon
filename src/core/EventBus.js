class EventBus {
    constructor() {
        this.events = {};
    }
    
    on(event, handler) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(handler);
    }
    
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
