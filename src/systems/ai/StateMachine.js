/**
 * Máquina de estados para controlar el comportamiento de la IA
 */
export default class StateMachine {
    constructor(initialState, states, context) {
        this.states = states;
        this.context = context;
        this.currentState = null;
        this.previousState = null;
        
        // Transicionar al estado inicial
        this.setState(initialState);
    }

    /**
     * Cambia al nuevo estado
     */
    setState(newState) {
        // Validar que el estado existe
        if (!this.states[newState]) {
            console.warn(`Estado "${newState}" no existe en la máquina de estados`);
            return;
        }

        // Salir del estado actual
        if (this.currentState && this.states[this.currentState].exit) {
            this.states[this.currentState].exit.call(this.context);
        }

        // Guardar estados
        this.previousState = this.currentState;
        this.currentState = newState;

        // Entrar al nuevo estado
        if (this.states[this.currentState].enter) {
            this.states[this.currentState].enter.call(this.context);
        }
    }

    /**
     * Actualiza el estado actual
     */
    update(delta) {
        if (this.currentState && this.states[this.currentState].update) {
            this.states[this.currentState].update.call(this.context, delta);
        }
    }

    /**
     * Obtiene el nombre del estado actual
     */
    getState() {
        return this.currentState;
    }

    /**
     * Verifica si está en un estado específico
     */
    isInState(stateName) {
        return this.currentState === stateName;
    }

    /**
     * Limpia la máquina de estados
     */
    destroy() {
        if (this.currentState && this.states[this.currentState].exit) {
            this.states[this.currentState].exit.call(this.context);
        }
        this.currentState = null;
        this.previousState = null;
        this.states = null;
        this.context = null;
    }
}