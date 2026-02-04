import { Start } from './scenes/Start.js';
import { MenuScene } from './scenes/MenuScene.js';
import { HubScene } from './scenes/HubScene.js';
import { SectorScene } from './scenes/SectorScene.js';
import { BossScene } from './scenes/BossScene.js';
import { EndingScene } from './scenes/EndingScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import PauseMenu from './ui/menus/PauseMenu.js';
import './core/RunManager.js';

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 1280,
    height: 720,
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
    scene: [Start, MenuScene,PauseMenu, PreloadScene, HubScene, SectorScene, BossScene, EndingScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
    
};

new Phaser.Game(config);
        
