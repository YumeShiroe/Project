import { playSfx } from "../features/audio.js";
import { pixelText, smallPixelText } from "../ui/style.js";
import { addScore } from "../features/score.js";

export default class EndingScene extends Phaser.Scene {
    constructor() {
        super('EndingScene');
    }

    create(data) {
        this.result = data;
        this.cameras.main.setBackgroundColor('#181425');
        this.cameras.main.fadeIn(1200, 255, 255, 255);

        const glimpse = this.add.image(240, 50, 'fungi', 13).setScale(3);
        glimpse.preFX.addGlow(0xfee761, 4, 0, false);
        this.tweens.add({
            targets: glimpse,
            y: 44, 
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        const lines = [
            'Behind the door, a single fungus glowed.',
            'It was the Glimpse of Hope.',
            'The legends said that Glimpse of Hope will fulfill your deepest desire.',
            'You decided to consume it.',
            'As you got home, you were greeted with a familiar figure, your mom finally awake...',
            'It took you ' + data.day + ' days. Congratulation!'
        ];

        playSfx(this, 'ending');

        for (let i = 0; i < lines.length; i++) {
            const text = this.add.text(240, 95 + i * 24, lines[i], {
                ...smallPixelText,
                color: '#ffffff',
                align: 'center',
                wordWrap: {
                    width: 420
                }
            }).setOrigin(0.5).setAlpha(0);
            this.tweens.add({
                targets: text,
                alpha: 1,
                delay: 1500 + i * 1500,
                duration: 800
            });
        }

        const prompt = this.add.text(240, 240, 'Press Enter or tap the screen to play again', {
            ...pixelText,
            color: '#8b9bb4'
        }).setOrigin(0.5).setAlpha(0);
        this.time.delayedCall(1500 + lines.length * 1500, () => {
            prompt.setAlpha(1);
            this.tweens.add({
                targets: prompt,
                alpha: 0.3, 
                duration: 700,
                yoyo: true,
                repeat: -1
            });
            this.input.keyboard.once('keydown-ENTER', () => this.signScoreboard());
            this.input.once('pointerdown', () => this.signScoreboard());
        });
    }

    signScoreboard() {
        if (this.signed) {
            return;
        }
        this.signed = true;
        let name = window.prompt('Enter your name (10 Letters max): ');
        if (name === null || name.trim() === '') {
            name = "FunGuy";
        }
        name = name.trim().slice(0, 10);
        const rank = addScore(name, this.result.day, this.result.gold);
        this.scene.start('ScoreScene', {
            fromEnding: true,
            highlight: rank
        });
    }
}