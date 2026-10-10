import BootScene from './scenes/BootScene.js';
import GameScene from './scenes/GameScene.js';
import InventoryScene from './scenes/InventoryScene.js';
import HotBarScene from './scenes/HotBarScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import BountyScene from './scenes/BountyScene.js';

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 480,
    height: 270,
    pixelArt: true,
    backgroundColor: '#1a1a2e',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [BootScene, GameScene, InventoryScene, HotBarScene, MenuScene, GameOverScene, BountyScene]
};

document.fonts.load('8px "Press Start 2P", "Silkscreen"').then(() => {
    new Phaser.Game(config);
});