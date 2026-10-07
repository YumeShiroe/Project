import { FUNGI } from '../data/fungi.js';
import { REGIONS } from '../data/region.js';

const noSpawnTile = [4, 5];

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        this.map = this.make.tilemap({ key: 'hazy-forest' });
        const tiles = this.map.addTilesetImage('forest', 'forest-tiles');

        this.groundLayer = this.map.createLayer('ground', tiles);
        this.map.createLayer('decor', tiles);
        this.collisionLayer = this.map.createLayer('collision', tiles);

        this.player = this.physics.add.sprite(this.map.widthInPixels / 2, this.map.heightInPixels / 2, 'player', 0);
        this.speed = 60;
        this.facing = 'down';

        this.aboveLayer = this.map.createLayer('above', tiles);

        this.collisionLayer.setCollisionByExclusion([-1]);
        this.physics.add.collider(this.player, this.collisionLayer);

        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.player.setCollideWorldBounds(true);

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.player);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D');

        this.aboveLayer.setDepth(10000);
        this.fungiGroup = this.physics.add.staticGroup();
        this.spawnFungi(REGIONS.hazyForest);
    }

    update() {
        const left = this.cursors.left.isDown || this.keys.A.isDown;
        const right = this.cursors.right.isDown || this.keys.D.isDown;
        const up = this.cursors.up.isDown || this.keys.W.isDown;
        const down = this.cursors.down.isDown || this.keys.S.isDown;

        this.player.setDepth(this.player.y);

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

    pickWeighted(table) {
        let sum = 0;
        for (const id in table) {
            sum += table[id];
        }

        let roll = Math.random() * sum;
        for (const id in table) {
            roll -= table[id];
            if (roll < 0)
                return id;
        }
    }

    spawnFungi(region) {
        const used = new Set();
        let placed = 0;
        let tries = 0;

        while (placed < region.fungiCount && tries < 1000) {
            tries++;
            const tx = Phaser.Math.Between(1, this.map.width - 2);
            const ty = Phaser.Math.Between(1, this.map.height - 2);
            const key = tx + ',' + ty;

            if (used.has(key))
                continue;
            if (this.collisionLayer.getTileAt(tx, ty))
                continue;
            if (this.aboveLayer.getTileAt(tx, ty))
                continue;

            const groundTile = this.groundLayer.getTileAt(tx, ty);
            if (groundTile && noSpawnTile.includes(groundTile.index))
                continue;

            const x = tx * 16 + 8;
            const y = ty * 16 + 8;
            if (Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) < 48)
                continue;

            used.add(key);
            this.createFungus(this.pickWeighted(region.spawnTable), x, y);
            placed++;
        }
    }

    createFungus(id, x, y) {
        const data = FUNGI[id];
        const fungus = this.fungiGroup.create(x, y, 'fungi', data.frame);
        fungus.fungusId = id;
        fungus.setDepth(y);

        if (data.glow !== null) {
            const glow = fungus.preFX.addGlow(data.glow, 4, 0);
            this.tweens.add ({
                targets: glow,
                outerStrength: 1,
                duration: 900,
                yoyo: true,
                repeat: -1
            });
        }
        return fungus;
    }
}