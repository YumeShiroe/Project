import { pixelText, smallPixelText } from "../ui/style.js";
import { playMusic, playSfx } from "../features/audio.js";

export default class TitleScene extends Phaser.Scene {
    constructor() {
        super('TitleScene');
    }

    create() {
        this.add.image(0, 0, 'title-bg').setOrigin(0);
        playMusic(this, 'home');

        const logo = this.add.image(240, 56, 'fungi', 13).setScale(3);
        logo.preFX.addGlow(0xfee761, 4, 0, false);
        this.tweens.add({
            targets: logo,
            y: 50,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.options = [
            {
                label: 'Play',
                action: () => this.scene.start('GameScene')    
            },
            {
                label: 'Scoreboard',
                action: () => this.scene.start('ScoreScene')
            },
            {
                label: 'Setting',
                action: () => this.scene.start('SettingScene')
            }
        ];

        this.buttons = [];
        for (let i = 0; i < this.options.length; i++) {
            const y = 150 + i * 24;
            const button = this.add.nineslice(240, y, 'ui-button', 0, 120, 14, 4, 4, 4, 4);
            button.setInteractive({
                useHandCursor: true
            });
            button.on('pointerover', () => this.select(i));
            button.on('pointerdown', () => {
                this.select(i);
                this.choose();
            });   
            this.add.text(240, y, this.options[i].label, {
                ...pixelText,
                stroke: '#181425',
                strokeThickness: 2
            }).setOrigin(0.5);
            this.buttons.push(button);
        }

        this.selected = 0;
        this.select(0, true);
        this.input.keyboard.on('keydown-W', () => this.select(this.selected - 1));
        this.input.keyboard.on('keydown-UP', () => this.select(this.selected - 1));
        this.input.keyboard.on('keydown-S', () => this.select(this.selected + 1));
        this.input.keyboard.on('keydown-DOWN', () => this.select(this.selected + 1));
        this.input.keyboard.on('keydown-E', () => this.choose());
        this.input.keyboard.on('keydown-ENTER', () => this.choose());
        

    }

    select(index, silent = false) {
        const count = this.options.length;
        this.selected = (index + count) % count;
        for (let i = 0; i < this.buttons.length; i++) {
            if (i === this.selected) {
                this.buttons[i].setTexture('ui-button-active');
            } else {
                this.buttons[i].setTexture('ui-button');
            }
        }

        if (!silent) {
            playSfx(this, 'ui_click');
        }

    }

    choose() {
        playSfx(this, 'ui_confirm');
        this.options[this.selected].action();
    }
}