import { playSfx } from "../features/audio.js";
import { pixelText } from "../ui/style.js";

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create(data) {
        this.options = data.options;
        this.selected = 0;
        const width = 150;
        const height = 42 + this.options.length * 18;
        const top = (270 - height) / 2;

        this.add.nineslice(240, 135, 'ui-panel', 0, width, height, 12, 12, 12, 12);
        this.add.text(240, top + 16, data.title, {
            ...pixelText,
            color: '#733e39'
        }).setOrigin(0.5);

        this.buttons = [];
        this.labels = [];
        for (let i = 0; i < this.options.length; i++) {
            const y = top + 37 + i * 18;

            const button = this.add.nineslice(240, y, 'ui-button', 0, 110, 15, 4, 4, 4, 4).setInteractive({ useHandCursor: true });
            button.on('pointerover', () => this.select(i));
            button.on('pointerdown', () => this.choose());

            const label = this.add.text(240, y, this.options[i].label, {
                ...pixelText,
                stroke: '#181425',
                strokeThickness: 2
            }).setOrigin(0.5);

            this.buttons.push(button);
            this.labels.push(label);
        }
        this.select(0);

        this.input.keyboard.on('keydown-W', () => this.select(this.selected - 1));
        this.input.keyboard.on('keydown-UP', () => this.select(this.selected - 1));
        this.input.keyboard.on('keydown-S', () => this.select(this.selected + 1));
        this.input.keyboard.on('keydown-DOWN', () => this.select(this.selected + 1));
        this.input.keyboard.on('keydown-E', () => this.choose());
        this.input.keyboard.on('keydown-ENTER', () => this.choose());
        this.input.keyboard.on('keydown-ESC', () => this.close(null));
    }

    select(index) {
        const count = this.options.length;
        this.selected = (index + count) % count;
        for (let i = 0; i < this.buttons.length; i++) {
            if (i === this.selected) {
                playSfx(this, 'ui_confirm');
                this.buttons[i].setTexture('ui-button-active');
            } else {
                playSfx(this, 'ui_click');
                this.buttons[i].setTexture('ui-button');
            }
        }
    }

    choose() {
        this.close(this.options[this.selected].action);
    }

    close(action) {
        const game = this.scene.get('GameScene');
        this.scene.resume('GameScene');
        if (action !== null) {
            game.events.emit('menu-action', action);
        }
        this.scene.stop();
    }
}