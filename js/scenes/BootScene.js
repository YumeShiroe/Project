// Placeholder to check whether scene works.

import Inventory from '../features/inventory.js';
import Hotbar from '../features/hotbar.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        this.load.spritesheet('player', 'assets/sprites/player.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.image('forest-tiles', 'assets/tilesets/forest.png');
        this.load.tilemapTiledJSON('hazy-forest', 'assets/maps/hazy-forest.tmj');

        this.load.image('inventory-ui', 'assets/UI/inventory.png');
        this.load.image('lock', 'assets/UI/lock.png');

        this.load.spritesheet('fungi', 'assets/sprites/fungi.png', {
            frameWidth: 16,
            frameHeight: 16
        });
    }

    create() {
        this.anims.create ({
            key: 'walk-down',
            frames: this.anims.generateFrameNumbers('player', { frames: [1, 0, 2, 0] }),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create ({
            key: 'walk-up',
            frames: this.anims.generateFrameNumbers('player', { frames: [4, 3, 5, 3] }),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create ({
            key: 'walk-side',
            frames: this.anims.generateFrameNumbers('player', { frames: [7, 6] }),
            frameRate: 6,
            repeat: -1
        });

        const inventory = new Inventory();
        
        this.registry.set('inventory', inventory);
        this.registry.set('hotbar', new Hotbar(inventory));
        this.registry.set('learned', new Set());
        
        this.scene.start('GameScene');
    }
}