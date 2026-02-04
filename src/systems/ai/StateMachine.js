/**
 * Sistema de máquina de estados para controlar el comportamiento de los enemigos
 */

/**
 * Estado individual de la máquina de estados
 */
export class State {
    constructor(name) {
        this.name = name;
        this.transitions = new Map();
        this.onEnter = null;
        this.onUpdate = null;
        this.onExit = null;
    }
    
    /**
     * Añade una transición a otro estado
     */
    addTransition(condition, targetStateName) {
        this.transitions.set(condition, targetStateName);
        return this;
    }
    
    /**
     * Establece la función que se ejecuta al entrar al estado
     */
    setOnEnter(callback) {
        this.onEnter = callback;
        return this;
    }
    
    /**
     * Establece la función que se ejecuta cada frame en el estado
     */
    setOnUpdate(callback) {
        this.onUpdate = callback;
        return this;
    }
    
    /**
     * Establece la función que se ejecuta al salir del estado
     */
    setOnExit(callback) {
        this.onExit = callback;
        return this;
    }
    
    /**
     * Ejecuta las callbacks del estado
     */
    enter(context) {
        if (this.onEnter) {
            this.onEnter(context);
        }
    }
    
    update(context, time, delta) {
        if (this.onUpdate) {
            this.onUpdate(context, time, delta);
        }
    }
    
    exit(context) {
        if (this.onExit) {
            this.onExit(context);
        }
    }
    
    /**
     * Evalúa las transiciones y devuelve el nombre del siguiente estado si aplica
     */
    evaluateTransitions(context) {
        for (const [condition, targetState] of this.transitions) {
            if (condition(context)) {
                return targetState;
            }
        }
        return null;
    }
}

/**
 * Máquina de estados finita
 */
export class StateMachine {
    constructor(context, initialStateName = null) {
        this.context = context;
        this.states = new Map();
        this.currentState = null;
        this.initialStateName = initialStateName;
        this.isRunning = false;
        
        // Debug
        this.debugMode = false;
        this.stateHistory = [];
        this.maxHistoryLength = 10;
    }
    
    /**
     * Añade un nuevo estado a la máquina
     */
    addState(state) {
        this.states.set(state.name, state);
        
        // Si es el primer estado y no hay inicial, establecerlo
        if (!this.initialStateName && this.states.size === 1) {
            this.initialStateName = state.name;
        }
        
        return this;
    }
    
    /**
     * Crea y añade un nuevo estado
     */
    createState(name) {
        const state = new State(name);
        this.addState(state);
        return state;
    }
    
    /**
     * Inicia la máquina de estados
     */
    start() {
        if (!this.initialStateName) {
            console.error('StateMachine: No initial state set');
            return;
        }
        
        this.isRunning = true;
        this.changeState(this.initialStateName);
    }
    
    /**
     * Detiene la máquina de estados
     */
    stop() {
        if (this.currentState) {
            this.currentState.exit(this.context);
        }
        this.isRunning = false;
        this.currentState = null;
    }
    
    /**
     * Cambia al estado especificado
     */
    changeState(stateName) {
        const newState = this.states.get(stateName);
        
        if (!newState) {
            console.error(`StateMachine: State "${stateName}" not found`);
            return;
        }
        
        // Salir del estado actual
        if (this.currentState) {
            this.currentState.exit(this.context);
            
            if (this.debugMode) {
                console.log(`State transition: ${this.currentState.name} -> ${stateName}`);
            }
        }
        
        // Cambiar al nuevo estado
        this.currentState = newState;
        this.currentState.enter(this.context);
        
        // Guardar en historial
        this.stateHistory.push({
            state: stateName,
            timestamp: Date.now()
        });
        
        if (this.stateHistory.length > this.maxHistoryLength) {
            this.stateHistory.shift();
        }
    }
    
    /**
     * Fuerza un cambio de estado sin evaluar transiciones
     */
    forceState(stateName) {
        this.changeState(stateName);
    }
    
    /**
     * Actualiza la máquina de estados
     */
    update(time, delta) {
        if (!this.isRunning || !this.currentState) {
            return;
        }
        
        // Actualizar el estado actual
        this.currentState.update(this.context, time, delta);
        
        // Evaluar transiciones
        const nextState = this.currentState.evaluateTransitions(this.context);
        
        if (nextState) {
            this.changeState(nextState);
        }
    }
    
    /**
     * Obtiene el nombre del estado actual
     */
    getCurrentStateName() {
        return this.currentState ? this.currentState.name : null;
    }
    
    /**
     * Verifica si está en un estado específico
     */
    isInState(stateName) {
        return this.currentState && this.currentState.name === stateName;
    }
    
    /**
     * Activa o desactiva el modo debug
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
    }
    
    /**
     * Obtiene el historial de estados
     */
    getStateHistory() {
        return [...this.stateHistory];
    }
    
    /**
     * Limpia y destruye la máquina de estados
     */
    destroy() {
        this.stop();
        this.states.clear();
        this.stateHistory = [];
        this.context = null;
    }
}

/**
 * Builder para crear máquinas de estados de forma fluida
 */
export class StateMachineBuilder {
    constructor(context) {
        this.context = context;
        this.machine = new StateMachine(context);
        this.currentStateBeingBuilt = null;
    }
    
    /**
     * Comienza a construir un nuevo estado
     */
    state(name) {
        this.currentStateBeingBuilt = this.machine.createState(name);
        return this;
    }
    
    /**
     * Establece el estado inicial
     */
    initial(stateName) {
        this.machine.initialStateName = stateName;
        return this;
    }
    
    /**
     * Añade callback onEnter al estado actual
     */
    onEnter(callback) {
        if (this.currentStateBeingBuilt) {
            this.currentStateBeingBuilt.setOnEnter(callback);
        }
        return this;
    }
    
    /**
     * Añade callback onUpdate al estado actual
     */
    onUpdate(callback) {
        if (this.currentStateBeingBuilt) {
            this.currentStateBeingBuilt.setOnUpdate(callback);
        }
        return this;
    }
    
    /**
     * Añade callback onExit al estado actual
     */
    onExit(callback) {
        if (this.currentStateBeingBuilt) {
            this.currentStateBeingBuilt.setOnExit(callback);
        }
        return this;
    }
    
    /**
     * Añade una transición al estado actual
     */
    transition(condition, targetState) {
        if (this.currentStateBeingBuilt) {
            this.currentStateBeingBuilt.addTransition(condition, targetState);
        }
        return this;
    }
    
    /**
     * Activa el modo debug
     */
    debug() {
        this.machine.setDebugMode(true);
        return this;
    }
    
    /**
     * Construye y devuelve la máquina de estados
     */
    build() {
        return this.machine;
    }
}

/**
 * Condiciones de transición comunes
 */
export const Conditions = {
    /**
     * El jugador está en rango de detección
     */
    playerInDetectionRange: (enemy) => {
        return enemy.canDetectPlayer();
    },
    
    /**
     * El jugador está fuera de rango de detección
     */
    playerOutOfDetectionRange: (enemy) => {
        return !enemy.canDetectPlayer();
    },
    
    /**
     * El jugador está en rango de ataque
     */
    playerInAttackRange: (enemy) => {
        return enemy.isPlayerInAttackRange();
    },
    
    /**
     * El jugador está fuera de rango de ataque
     */
    playerOutOfAttackRange: (enemy) => {
        return !enemy.isPlayerInAttackRange();
    },
    
    /**
     * La salud está por debajo de un porcentaje
     */
    healthBelow: (percentage) => {
        return (enemy) => {
            return (enemy.health / enemy.maxHealth) < percentage;
        };
    },
    
    /**
     * La salud está por encima de un porcentaje
     */
    healthAbove: (percentage) => {
        return (enemy) => {
            return (enemy.health / enemy.maxHealth) > percentage;
        };
    },
    
    /**
     * Combina múltiples condiciones con AND
     */
    and: (...conditions) => {
        return (context) => {
            return conditions.every(condition => condition(context));
        };
    },
    
    /**
     * Combina múltiples condiciones con OR
     */
    or: (...conditions) => {
        return (context) => {
            return conditions.some(condition => condition(context));
        };
    },
    
    /**
     * Invierte una condición
     */
    not: (condition) => {
        return (context) => {
            return !condition(context);
        };
    }
};
