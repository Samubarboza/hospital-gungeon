import PreloadScene from './scenes/PreloadScene.js';
import { Start } from './scenes/Start.js';
import { MenuScene } from './scenes/MenuScene.js';
import { HubScene } from './scenes/HubScene.js';
import { SectorScene } from './scenes/SectorScene.js';
import { BossScene } from './scenes/BossScene.js';
import { EndingScene } from './scenes/EndingScene.js';

export const gameConfig = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    
    scene: [
        Start,
        MenuScene,
        PreloadScene,
        HubScene,
        SectorScene,
        BossScene,
        EndingScene
    ]
};
