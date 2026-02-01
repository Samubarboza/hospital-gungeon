import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MenuScene } from './scenes/MenuScene';
import { HubScene } from './scenes/HubScene';
import { SectorScene } from './scenes/SectorScene';
import { BossScene } from './scenes/BossScene';

export const gameConfig = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    
    scene: [
        BootScene,
        PreloadScene,
        MenuScene,
        HubScene,
        SectorScene,
        BossScene
    ]
};
