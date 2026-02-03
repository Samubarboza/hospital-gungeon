import NarrativeSystem from './NarrativeSystem.js';

export default class Triggers {
    constructor(narrativeSystem) {
        this.narrativeSystem = narrativeSystem;
    }

    checkTrigger(event) { 
        switch(event) {
            case 'playerEnterHospital':
                this.narrativeSystem.startDialogue('intro');
                break;
            default:
                console.log(\`No hay trigger para: \${event}\`);
        }
    }
}