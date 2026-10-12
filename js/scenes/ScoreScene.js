import { pixelText, smallPixelText } from "../ui/style.js";
import { playMusic, playSfx } from "../features/audio.js";
import { loadScores } from "../features/score.js";

export default class ScoreScene extends Phaser.Scene {
    constructor() {
        super('ScoreScene');
    }

    create(data) {
        this.fromEnding = false;
        let highlight = -1;
        if (data && data.fromEnding) {
            this.fromEnding = true;
            highlight = data.highlight;
        }

        this.add.image(0, 0, 'score-bg').setOrigin(0);
        const scores = loadScores();
        if (scores.length === 0) {
            this.add.text(240, 130, 'No Records...', {
                ...pixelText,
                color: '#3e2731'
            }).setOrigin(0.5);
        }
        for (let i = 0; i < scores.length; i++) {
            const y = 78 + i * 18;
            let style;
            if (i === highlight) {
                this.add.rectangle(240, y, 270, 16, 0xfee761, 0.6);
                style = {
                    ...pixelText,
                    color: '#a22633'
                };
            }
            this.add.text(115, y, String(i + 1), style).setOrigin(0.5);
            this.add.text(140, y, scores[i].name, style).setOrigin(0, 0.5);
            this.add.text(290, y, String(scores[i].days), {
                ...pixelText,
                color: '#a22633'
            }).setOrigin(0.5);
            this.add.text(350, y, String(scores[i].gold), {
                ...pixelText,
                color: '#a22633'
            }).setOrigin(0.5);
        }

        const back = this.add.nineslice(240, 220, 'ui-button-active', 0, 90, 16, 4, 4, 4, 4);
        back.setInteractive({
            useHandCursor: true
        });
        back.on('pointerdown', () => {
            this.back
        });
        this.add.text(240, 220, 'Back', {
            ...pixelText,
            stroke: '#181425',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.input.keyboard.on('keydown-ESC', () => this.back());
        this.input.keyboard.on('keydown-ENTER', () => this.back());
    }

    back() {
        playSfx(this, 'ui_confirm');
        if (this.fromEnding) {
            window.location.reload();
        } else {
            this.scene.start('TitleScene');
        }
    }
}