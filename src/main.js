import { Start } from './scenes/menus/Start.js';
import { MenuScene } from './scenes/menus/MenuScene.js';
import { HubScene } from './scenes/gameplay/HubScene.js';
import { SectorScene } from './scenes/gameplay/SectorScene.js';
import { BossScene } from './scenes/gameplay/BossScene.js';
import { EndingScene } from './scenes/story/EndingScene.js';
import PreloadScene from './scenes/boot/PreloadScene.js';
import { NarrativeScene } from './scenes/story/NarrativeScene.js';
import { HudScene } from './scenes/ui/hud/HudScene.js';
import { PauseMenu } from './scenes/ui/menus/PauseMenu.js';
import './core/RunManager.js';

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#000000',
    pixelArt: true,
    antialias: false,
    roundPixels: true,
    pauseOnBlur: false,
    input: {
        keyboard: true,
        mouse: true,
        gamepad: false,
        windowEvents: true
    },
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: [
        Start,
        MenuScene,
        PreloadScene,
        NarrativeScene,
        HubScene,
        SectorScene,
        BossScene,
        EndingScene,
        HudScene,
        PauseMenu
    ],
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
    
};

new Phaser.Game(config);
        
