import { FUNGI } from '../data/fungi.js';
import { pixelText, smallPixelText } from '../ui/style.js';

const hotbar_x = 178;
const hotbar_y = 232;
const hotbar_slot_x = 9;
const hotbar_slot_y = 8;
const hotbar_distance = 22;

export default class HotBarScene extends Phaser.Scene {
    constructor() {
        super('HotBarScene');
    }

    create() {
        this.inventory = this.registry.get('inventory');
        this.hotbar = this.registry.get('hotbar');

        this.add.image(hotbar_x, hotbar_y, 'hotbar-ui').setOrigin(0);
        this.items = this.add.container(hotbar_x, hotbar_y);
        this.drawHotBar();

        const onChange = () => this.drawHotBar();
        this.hotbar.events.on('changed', onChange);
        this.inventory.events.on('changed', onChange);
        this.events.once('shutdown', () => {
            this.hotbar.events.off('changed', onChange);
            this.inventory.events.off('changed', onChange);
        });

        this.state = this.registry.get('state');
        this.add.nineslice(4, 4, 'ui-panel', 0, 120, 24, 12, 12, 12, 12).setOrigin(0);
        this.hudText = this.add.text(14, 16, '', {
            ...smallPixelText,
            color: '#3e2731',
        }).setOrigin(0, 0.5);
    }

    drawHotBar() {
        this.items.removeAll(true);
        for (let i = 0; i < this.hotbar.slots.length; i++) {
            const sx = hotbar_slot_x + i * hotbar_distance;
            const sy = hotbar_slot_y;
            const id = this.hotbar.slots[i];

            if (id !== null) {
                const count = this.hotbar.countAt(i);
                const icon = this.add.image(sx + 10, sy + 10, 'fungi', FUNGI[id].frame);
                if (count === 0) 
                icon.setAlpha(0.35);
                this.items.add(icon);
            }

            this.items.add(this.add.text(sx + 2, sy + 10, String(i + 1), {
                ...smallPixelText,
                stroke: '#181425',
                strokeThickness: 2
            }));
        }
    }

    update() {
        this.hudText.setText('Day ' + this.state.day + ' ' + this.state.clockText());
    }
}