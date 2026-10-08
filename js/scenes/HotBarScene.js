import { FUNGI } from '../data/fungi.js';
import { pixelText } from '../ui/style.js';

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

        this.add.image(hotbar_x, hotbar_y, 'hotbar-ui').setOrigin(0.5);
        this.items = this.add.container(hotbar_x, hotbar_y);
        this.drawHotBar();

        const onChange = () => this.drawHotBar();
        this.hotbar.events.on('changed', onChange);
        this.inventory.events.on('changed', onChange);
        this.events.once('shutdown', () => {
            this.hotbar.events.off('changed', onChange);
            this.inventory.events.off('chagned', onChange);
        });
    }

    drawHotBar() {
        this.items.removeAll(true);
        for (let i = 0; i < this.hotbar.length; i++) {
            const sx = hotbar_slot_x + i * hotbar_distance;
            const sy = hotbar_slot_y;
            const id = this.hotbar.slots[i];
        }

        if (id !== null) {
            const count = this.hotbar.countAt(i);
            const icon = this.add.image(sx + 10, sy + 10, 'fungi', FUNGI[id].frame)
        }
    }
}