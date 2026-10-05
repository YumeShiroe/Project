// Placeholder to check whether scene works.

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        this.load.spritesheet('player', 'assets/sprites/player.png', {
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

        
        this.scene.start('GameScene');
    }
}