import { sceneManager } from '../../core/SceneManager.js';

const FALLBACK_STORY = {
    title: 'Hospital',
    lines: [
        'La noche cae sobre el hospital.',
        'Las luces parpadean y los pasillos estan vacios.',
        'Eres el ultimo en pie.',
        'Sobrevive y encuentra la salida.'
    ],
    hint: 'Presiona ENTER o haz click para continuar'
};

export class NarrativeScene extends Phaser.Scene {
    constructor() {
        super('NarrativeScene');
        this.story = null;
        this.lineIndex = 0;
        this.isDone = false;
        this.nextSceneKey = 'HubScene';
    }

    init(data = {}) {
        this.nextSceneKey = data.nextScene ?? 'HubScene';
        this.story = null;
        this.lineIndex = 0;
        this.isDone = false;
    }

    create() {
        const story = this.cache.json.get('narrative-intro') || FALLBACK_STORY;
        this.story = story;

        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor('#040218');

        this.titleText = this.add.text(width / 2, height * 0.18, story.title || FALLBACK_STORY.title, {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.bodyText = this.add.text(width / 2, height * 0.45, '', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#d6d6ff',
            align: 'center',
            wordWrap: { width: width * 0.7 }
        }).setOrigin(0.5);

        this.hintText = this.add.text(width / 2, height * 0.82, story.hint || FALLBACK_STORY.hint, {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#a6a6c8'
        }).setOrigin(0.5);

        this.showNextLine();

        this.input.keyboard.on('keydown-ENTER', () => this.showNextLine());
        this.input.on('pointerdown', () => this.showNextLine());
    }

    showNextLine() {
        if (this.isDone) return;
        const lines = this.story?.lines ?? [];
        if (this.lineIndex >= lines.length) {
            this.isDone = true;
            sceneManager.go(this, this.nextSceneKey);
            return;
        }
        this.bodyText.setText(lines[this.lineIndex]);
        this.lineIndex += 1;
    }
}
