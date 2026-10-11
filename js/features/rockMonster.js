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
        this.nextThrowAt = scene.time.now + 1500;
        this.play('rock-idle')
    }

    spot(player) {
        if (this.dead || this.busy)
            return;
        if (this.scene.time.now < this.nextActionAt)
            return;
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        if (distance > 160) {
            return;
        }
        if (distance > 60 && this.scene.time.now >= this.nextThrowAt) {
            this.throwAt(player);
        } else {
            this.hopToward(player);
        }
    }

    hopToward(player) {
        this.busy = true;
        this.play('rock-hop');

        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        this.setVelocity(Math.cos(angle) * 50, Math.sin(angle) * 50);

        this.scene.time.delayedCall(385, () => {
            if (this.dead)
                return;
            this.setVelocity(0, 0);
            this.play('rock-idle');
            this.busy = false;
            this.nextActionAt = this.scene.time.now + 800;
        });
    }

    throwAt(player) {
        this.busy = true;
        this.setVelocity(0, 0);
        this.play('rock-throw');
        const targetX = player.x;
        const targetY = player.y;
        this.once('animationcomplete-rock-throw', () => {
            if (this.dead) {
                return;
            }
            this.scene.throwRock(this.x, this.y, targetX, targetY);
            this.play('rock-idle');
            this.busy = false;
            this.nextActionAt = this.scene.time.now + 600;
            this.nextThrowAt = this.scene.time.now + 2000;
        })
    }

    takeDamageMonster(damage, fromX, fromY, push = 140) {
        if (this.dead)
            return;
        this.hp -= damage;
        this.busy = true;
        this.anims.stop();
        this.setFrame(7);
        const angle = Phaser.Math.Angle.Between(fromX, fromY, this.x, this.y);
        this.setVelocity(Math.cos(angle) * push, Math.sin(angle) * push);

        if (this.hp <= 0) {
            this.die();
            return;
        }

        this.scene.time.delayedCall(250, () => {
            if (this.dead)
                return;
            this.setVelocity(0, 0);
            this.play('rock-idle');
            this.busy = false;
            this.nextActionAt = this.scene.time.now + 700;
        });
    }

    die() {
        this.dead = true;
        this.scene.time.delayedCall(200, () => {
            this.setVelocity(0, 0);
            this.body.enable = false;
            this.play('rock-death');
            this.once('animationcomplete-rock-death', () => {
                this.scene.tweens.add({
                    targets: this,
                    alpha: 0,
                    delay: 600,
                    duration: 400,
                    onComplete: () => this.destroy()
                });
            });
        });
    }
}