export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.player = this.add.sprite(240, 135, 'player', 0);
    }
}