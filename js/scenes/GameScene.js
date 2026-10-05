export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.player = this.physics.add.sprite(240, 135, 'player', 0);
        this.speed = 60;
        this.facing = 'down';

        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D');
    }

    update() {
        const left = this.cursors.left.isDown || this.keys.A.isDown;
        const right = this.cursors.right.isDown || this.keys.D.isDown;
        const up = this.cursors.up.isDown || this.keys.W.isDown;
        const down = this.cursors.down.isDown || this.keys.S.isDown;

        let vx = 0;
        let vy = 0;

        if (left) vx = -1;
        else if (right) vx = 1;

        if (up) vy = -1;
        else if (down) vy = 1;

        this.player.setVelocity(vx, vy);
        this.player.body.velocity.normalize().scale(this.speed);

        if (vx !== 0) {
            this.player.anims.play('walk-side', true);
            this.player.setFlipX(vx < 0);
            this.facing = 'side';
        } else if (vy < 0) {
            this.player.anims.play('walk-up', true);
            this.facing = 'up';
        } else if (vy > 0) {
            this.player.anims.play('walk-down', true);
            this.facing = 'down';
        } else {
            this.player.anims.stop();
            const idleFrames = { down: 0, up: 3, side: 6 };
            this.player.setFrame(idleFrames[this.facing]);
        }
    }
}