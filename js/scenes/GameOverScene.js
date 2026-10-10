import { pixelText } from "../ui/style.js";

export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    create() {
        const state = this.registry.get('state');
        this.cameras.main.setBackgroundColor('#181425');
        this.add.text(240, 100, 'GAME OVER', {
            ...pixelText,
            color: '#e43b44',
        }).setOrigin(0.5);
        this.add.text(240, 130, "Mom's hollowfied state has gotten worse to the point it can not be saved", {
            ...pixelText,
            align: 'center',
            wordWrap: {
                width: 400
            }
        }).setOrigin(0.5);
        this.add.text(240, 185, 'Press R to try again', {
            ...pixelText,
            color: '#c0cbdc'
        }).setOrigin(0.5);
        this.input.keyboard.once('keydown-R', () => window.location.reload());
    }
}