export default class RockMonster extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'rock-monster', 0);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.body.setSize(16, 12).setOffset(4, 11);
        this.setImmovable(true);
        this.hp = 3;
        this.dead = false;
        this.busy = false;
        this.nextActionAt = scene.time.now + 1000;
        this.play('rock-idle')
    }
}