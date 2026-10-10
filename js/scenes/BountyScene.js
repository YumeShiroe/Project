import { FUNGI } from '../data/fungi.js';
import { pixelText, smallPixelText } from '../ui/style.js';

const VISIBLE_ROWS = 4;

export default class BountyScene extends Phaser.Scene {
    constructor() {
        super('BountyScene');
    }

    create() {
        this.state = this.registry.get('state');
        this.inventory = this.registry.get('inventory');
        this.selected = 0;
        this.scroll = 0;

        this.add.rectangle(0, 0, 480, 270, 0x181425, 0.6).setOrigin(0);

        this.board = this.add.container(0, 0);
        this.draw();

        this.input.keyboard.on('keydown-W', () => this.select(this.selected - 1));
        this.input.keyboard.on('keydown-UP', () => this.select(this.selected - 1));
        this.input.keyboard.on('keydown-S', () => this.select(this.selected + 1));
        this.input.keyboard.on('keydown-DOWN', () => this.select(this.selected + 1));
        this.input.keyboard.on('keydown-E', () => this.turnIn());
        this.input.keyboard.on('keydown-ENTER', () => this.turnIn());
        this.input.keyboard.on('keydown-ESC', () => this.close());  

        this.input.on('wheel', (pointer, objects, dx, dy) => {
            if (dy > 0)
                this.select(this.selected + 1);
            if (dy < 0)
                this.select(this.selected - 1);
        });
    }

    draw() {
        this.board.removeAll(true);
        const bounties = this.state.bounties;

        const width = 300;
        const height = 56 + VISIBLE_ROWS * 24;
        const left = (480 - width) / 2;
        const top = (270 - height) / 2;
        const shown = Math.min(bounties.length, VISIBLE_ROWS);
        const outline = {
            stroke: '#181425',
            strokeThickness: 2
        };

        this.board.add(this.add.image(240, 135, 'bounty-board'));
        this.board.add(this.add.text(240, top + 7, 'GUILD BOUNTIES', pixelText).setOrigin(0.5));
        for (let i = this.scroll; i < this.scroll + shown; i++) {
            const bounty = bounties[i];
            const y = top + 36 + (i - this.scroll) * 24;
            const have = this.inventory.countOf(bounty.id);
            const ready = have >= bounty.count;

            if (i === this.selected) {
                this.board.add(this.add.nineslice(240, y, 'ui-button-active', 0, 270, 20, 4, 4, 4, 4));
            }
            const zone = this.add.zone(240, y, 270, 20).setInteractive({
                useHandCursor: true
            });
            zone.on('pointerover', () => {
                if (this.selected !== i) {
                    this.select(i);
                }
            });
            zone.on('pointerdown', () => {
                this.turnIn();
            });
            const icon = this.add.image(left + 28, y, 'fungi', FUNGI[bounty.id].frame);
            const name = this.add.text(left + 40, y, bounty.count + 'x ' + FUNGI[bounty.id].name, {
                ...smallPixelText,
                ...outline
            }).setOrigin(0, 0.5);
            let progressText = have + '/' + bounty.count;
            let progressColor = '#ffffff';
            if (ready) {
                progressColor = '#63c74d';
            }
            if (bounty.done) {
                progressText = 'Done';
            }
            const progress = this.add.text(left + 200, y, progressText, {
                ...smallPixelText,
                ...outline,
                color: progressColor
            }).setOrigin(0.5);
            const reward = this.add.text(left + width - 24, y, bounty.reward + 'G', {
                ...smallPixelText,
                color: '#fee761'
            }).setOrigin(1, 0.5);
            const parts = [icon, name, progress, reward];
            if (bounty.done) {
                for (let p = 0; p < parts.length; p++) {
                    parts[p].setAlpha(0.45);
                }
            }
            this.board.add(zone);
            this.board.add(parts);
        }

        const arrowX = left + width - 22;
        if (this.scroll > 0) {
            this.board.add(this.add.triangle(arrowX, top + 18, 0, 5, 4, 0, 8, 5, 0x733e39).setOrigin(0.5));
        }
        if (this.scroll + shown < bounties.length) {
            this.board.add(this.add.triangle(arrowX, top + height - 13, 0, 0, 8, 0, 4, 5, 0x733e39).setOrigin(0.5));
        }

        this.board.add(this.add.text(240, top + height - 13, 'E: TURN IN    ESC: CLOSE    ' + this.inventory.coins + 'G', {
            ...smallPixelText,
            color: '#733e39',
        }).setOrigin(0.5));
    }

    select(index) {
        const count = this.state.bounties.length;
        this.selected = (index + count) % count;

        if (this.selected < this.scroll) {
            this.scroll = this.selected;
        }
        if (this.selected >= this.scroll + VISIBLE_ROWS) {
            this.scroll = this.selected - VISIBLE_ROWS + 1;
        }
        this.draw();
    }

    turnIn() {
        const bounty = this.state.bounties[this.selected];
        if (!bounty || bounty.done) {
            return;
        }

        if (this.state.turnInBounty(this.selected, this.inventory)) {
            this.flash('+' + bounty.reward + 'G', '#fee761');
        } else {
            this.flash('Not Enough', '#e43b44');
        }
        this.draw()
    }

    flash(text, color) {
        const label = this.add.text(240, 40, text, {
            ...pixelText,
            color: color,
            stroke: '#181425',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.tweens.add({
            targets: label,
            y: 28,
            alpha: 0,
            duration: 900,
            onComplete: () => label.destroy()
        });
    }

    close() {
        this.scene.resume('GameScene');
        this.scene.stop();
    }
}