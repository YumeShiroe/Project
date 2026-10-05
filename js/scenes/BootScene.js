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
        this.scene.start('GameScene');
    }
}