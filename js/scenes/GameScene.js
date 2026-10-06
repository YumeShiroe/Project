export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        const map = this.make.tilemap({ key: 'hazy-forest' });
        const tiles = map.addTilesetImage('forest', 'forest-tiles');

        map.createLayer('ground', tiles);
        map.createLayer('decor', tiles);
        this.collisionLayer = map.createLayer('collision', tiles);

        this.player = this.physics.add.sprite(map.widthInPixels / 2, map.heightInPixels / 2, 'player', 0);
        this.speed = 60;
        this.facing = 'down';

        map.createLayer('above', tiles);

        this.collisionLayer.setCollisionByExclusion([-1]);
        this.physics.add.collider(this.player, this.collisionLayer);

        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.player.setCollideWorldBounds(true);

        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player);

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