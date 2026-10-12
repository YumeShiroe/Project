import { pixelText, smallPixelText } from '../ui/style.js'
import { FUNGI } from '../data/fungi.js'

const panel_x = 141;
const panel_y = 69;
const slot_start_x = 23;
const slot_start_y = 23;
const slot_distance = 22;
const columns = 7;
const numberKeys = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'];

export default class InventoryScene extends Phaser.Scene {
    constructor() {
        super('InventoryScene');
    }

    create() {
        const tapToClose = this.add.zone(0, 0, 480, 270).setOrigin(0).setInteractive();
        tapToClose.on('pointerdown', () => this.close());
        this.inventory = this.registry.get('inventory');
        this.add.rectangle(0, 0, 480, 270, 0x181425, 0.6).setOrigin(0);

        this.panel = this.add.container(panel_x, panel_y);
        this.panel.add(this.add.image(0, 0, 'inventory-ui').setOrigin(0).setInteractive());
        this.panel.add(this.add.text(99, 7, 'INVENTORY', pixelText).setOrigin(0.5));
        this.highlight = this.add.rectangle(0, 0, 22, 22).setOrigin(0).setStrokeStyle(2, 0xfee761).setVisible(false);
        this.panel.add(this.highlight);

        this.drawSlots();
        this.drawStatus();
        this.createToolTip();

        this.input.keyboard.on('keydown-I', () => this.close());
        this.input.keyboard.on('keydown-ESC', () => this.close());

        this.hotbar = this.registry.get('hotbar');
        this.hoverId = null;

        for (let i = 0; i < numberKeys.length; i++) {
            this.input.keyboard.on('keydown-' + numberKeys[i], () => {
                this.assignHovered(i)
            });
        }
    }

    drawSlots() {
        for (let i = 0; i < this.inventory.totalInventorySlots; i++) {
            const sx = slot_start_x + (i % columns) * slot_distance;
            const sy = slot_start_y + Math.floor(i / columns) * slot_distance;

            if (i >= this.inventory.unlockedInventorySlots) {
                this.panel.add(this.add.rectangle(sx + 1, sy + 1, 18, 18, 0x3e2713, 0.6).setOrigin(0));
                this.panel.add(this.add.image(sx + 10, sy + 10, 'lock'));
                continue;
            }

            const slot = this.inventory.slots[i];
            if (slot === null)
                continue;

            this.panel.add(this.add.image(sx + 10, sy + 10, 'fungi', FUNGI[slot.id].frame));
            this.panel.add(this.add.text(sx + 21, sy + 21, String(slot.count), {
                ...pixelText,
                stroke: '#181425',
                strokeThickness: 2
            }).setOrigin(1, 1));

            const zone = this.add.zone(sx, sy, 20, 20).setOrigin(0).setInteractive();
            zone.on('pointerover', () => {
                this.hoverId = slot.id;
                this.showToolTip(slot.id, sx, sy);
            });
            zone.on('pointerout', () => {
                this.hoverId = null;
                this.hideToolTip();
            });
            zone.on('pointerdown', () => {
                this.hoverId = slot.id;
                this.assignHovered(this.freeHotbarSlot(slot.id));
            });
            this.panel.add(zone);
        }
    }

    freeHotbarSlot(id) {
        for (let i = 0; i < this.hotbar.slots.length; i++) {
            if (this.hotbar.slots[i] === id) {
                return i;
            }
        }

        for (let i = 0; i< this.hotbar.slots.length; i++) {
            if (this.hotbar.slots[i] === null) {
                return i;
            }
        }
        return this.hotbar.slots.length - 1;
    }

    drawStatus() {
        const dark = {
            ...pixelText,
            color: '#3e2731'
        };
        this.panel.add(this.add.text(36, 99, String(this.inventory.coins), dark).setOrigin(0, 0.5));
        const used = this.inventory.isUsedSlots();
        const unlocked = this.inventory.unlockedInventorySlots;
        this.panel.add(this.add.text(144, 99, used + '/' + unlocked, dark).setOrigin(0, 0.5));
    }

    createToolTip() {
        this.toolTip = this.add.container(0, 0).setVisible(false);
        this.toolTipBackGround = this.add.graphics();
        this.toolTipName = this.add.text(4, 4, '', pixelText);
        this.toolTipRank = this.add.text(4, 15, '', pixelText);
        this.toolTip.add([this.toolTipBackGround, this.toolTipName, this.toolTipRank]);
    }

    showToolTip(id, sx, sy) {
        const data = FUNGI[id];
        this.toolTipName.setText(data.name);
        this.toolTipRank.setText('Rank: ' + data.rank);

        const width = Math.max(this.toolTipName.width, this.toolTipRank.width) + 8;
        this.toolTipBackGround.clear();
        this.toolTipBackGround.fillStyle(0x181425, 1);
        this.toolTipBackGround.fillRect(0, 0, width, 27);
        this.toolTipBackGround.fillStyle(0x3e2731, 1);
        this.toolTipBackGround.fillRect(1, 1, width - 2, 25);

        let tx = panel_x + sx + 22;
        if (tx + width > 480)
            tx = panel_x + sx - width - 2;
        this.toolTip.setPosition(tx, panel_y + sy);
        this.toolTip.setVisible(true);

        this.highlight.setPosition(sx - 1, sy - 1).setVisible(true);
    }

    hideToolTip() {
        this.toolTip.setVisible(false);
        this.highlight.setVisible(false);
    }

    close() {
        this.scene.resume('GameScene');
        this.scene.stop();
    }

    assignHovered(index) {
        if (this.hoverId === null) 
            return;
        if (FUNGI[this.hoverId].usage === null)
            return;
        this.hotbar.assignFungus(index, this.hoverId);
    }
}