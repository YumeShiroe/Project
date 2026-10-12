import { pixelText, smallPixelText } from "../ui/style.js";
import { playMusic, playSfx } from "../features/audio.js";

export default class SettingScene extends Phaser.Scene {
    constructor() {
        super('SettingScene');
    }

    create() {
        this.add.image(0, 0, 'settings-bg').setOrigin(0);
        this.rows = [
            {
                label: 'Music',
                key: 'musicVolume'
            },
            {
                label: 'SFX',
                key: 'sfxVolume'
            }
        ];
        this.rowLabels = [];
        this.valueTexts = [];
        
        for (let i = 0; i < this.rows.length; i++) {
            const y = 110 + i * 24;
            const label = this.add.text(160, y, this.rows[i].length, {
                ...pixelText,
                color: '#3e2731'
            });
            label.setInteractive({
                useHandCursor: true
            });
            label.on('pointerdown', () => this.selectRow(i));
            const left = this.add.text(255, y, '<', {
                ...pixelText,
                color: '#3e2731'
            }).setOrigin(0.5);
            left.setInteractive({
                useHandCursor: true
            });
            left.on('pointerdown', () => {
                this.selectRow(i),
                this.change(-0.1)
            });
            const value = this.add.text(288, y, '', {
                ...pixelText,
                color: '#3e2731'
            }).setOrigin(0.5);
            const right = this.add.text(320, y, '>', {
                ...pixelText,
                color: '#3e2731'
            }).setOrigin(0.5);
            right.setInteractive({
                useHandCursor: true
            });
            right.on('pointerdown', () => {
                this.selectRow(i);
                this.change(0.1);
            });
            this.rowLabels.push(label);
            this.valueTexts.push(value);
        }

        const back = this.add.nineslice(240, 166, 'ui-button-active', 0, 90, 16, 4, 4, 4, 4);
        back.setInteractive({
            useHandCursor: true
        });
        back.on('pointerdown', () => this.back());
        this.add.text(240, 166, 'Back', {
            ...pixelText,
            stroke: '#181425',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.selected = 0;
        this.refresh();
        this.input.keyboard.on('keydown-W', () => this.selectRow(this.selected - 1));
        this.input.keyboard.on('keydown-UP', () => this.selectRow(this.selected - 1));
        this.input.keyboard.on('keydown-S', () => this.selectRow(this.selected + 1));
        this.input.keyboard.on('keydown-DOWN', () => this.selectRow(this.selected + 1));
        this.input.keyboard.on('keydown-A', () => this.change(-0.1));
        this.input.keyboard.on('keydown-LEFT', () => this.change(-0.1));
        this.input.keyboard.on('keydown-D', () => this.change(0.1));
        this.input.keyboard.on('keydown-RIGHT', () => this.change(0.1));
        this.input.keyboard.on('keydown-ENTER', () => this.back());
        this.input.keyboard.on('keydown-ESE', () => this.back());

    }

    selectRow(index) {
        const count = this.rows.length;
        this.selected = (index + count) % count;
        this.refresh();
    }

    change(amount) {
        const key = this.rows[this.selected].key;
        let value = this.registry.get(key) + amount;
        value = Math.round(value * 10) / 10;
        value = Phaser.Math.Clamp(value, 0, 1);
        this.registry.set(key, value);
        const music = this.registry.get('music');
        if (key === 'musicVolume' && music) {
            music.setVolume(value);
        }
        playSfx(this, 'ui_click');
        this.save();
        this.refresh();
    }

    refresh() {
        for (let i = 0; i < this.rows.length; i++) {
            const percent = Math.round(this.registry.get(this.rows[i].key) * 100);
            this.valueTexts[i].setText(percent + '%');

            if (i === this.selected) {
                this.rowLabels[i].setColor('#e43b44');
            } else {
                this.rowLabels[i].setColor('#3e2731');
            }
        }
    }

    save() {
        try {
            localStorage.setItem('fungiSettings', JSON.stringify({
                musicVolume: this.registry.get('musicVolume'),
                sfxVolume: this.registry.get('sfxVolume')
            }));
        } catch (error) {
            return;
        }
    }

    back() {
        playSfx(this, 'ui_confirm');
        this.scene.start('TitleScene');
    }
}