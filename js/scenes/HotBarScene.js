import { FUNGI } from '../data/fungi.js';
import { pixelText, smallPixelText } from '../ui/style.js';

const hotbar_x = 178;
const hotbar_y = 232;
const hotbar_slot_x = 9;
const hotbar_slot_y = 8;
const hotbar_distance = 22;
const status_x = 366;
const status_y = 4;
const bar_x = 22;
const hp_y = 10;
const mp_y = 20;
const bar_width = 77;
const skill_x = 442;
const skill_y = 186;
const skill_slot_x = 8;
const skill_slot_y = 9;
const SKILL_KEYS = ['J', 'K', 'L'];
const SKILLS = [
    {
        id: 'force', 
        cost: 10
    },
    {
        id: 'projection',
        cost: 25,
    },
    {
        id: 'blitz',
        cost: 20
    }

];

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

        this.add.image(status_x, status_y, 'status-ui').setOrigin(0);
        this.hpFill = this.add.image(status_x + bar_x, status_y + hp_y, 'hp-fill').setOrigin(0);
        this.mpFill = this.add.image(status_x + bar_x, status_y + mp_y, 'mp-fill').setOrigin(0);

        this.learned = this.registry.get('learned');
        this.skillIcons = [];
        this.skillLocks = [];

        this.add.image(skill_x, skill_y, 'skillbar-ui').setOrigin(0);
        for (let i = 0; i < SKILL_KEYS.length; i++) {
            const sx = skill_x + skill_slot_x;
            const sy = skill_y + skill_slot_y + i * hotbar_distance;

            const icon = this.add.image(sx + 10, sy + 10, 'fungi', FUNGI[SKILLS[i].id].frame);
            const lock = this.add.image(sx + 10, sy + 10, 'lock');
            this.skillIcons.push(icon);
            this.skillLocks.push(lock);

            this.add.text(sx + 2, sy + 10, SKILL_KEYS[i], {
                ...smallPixelText,
                stroke: '#181425',
                strokeThickness: 2
            });

            const zone = this.add.zone(sx, sy, 20, 20).setOrigin(0).setInteractive();
            zone.on('pointerdown', () => this.useSkill(i));
        }
        this.skillKeys = this.input.keyboard.addKeys('J,K,L');
    }

    useSkill(index) {
        if (this.scene.isPaused('GameScene'))
            return;
        this.scene.get('GameScene').events.emit('use-skill', index);
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

    update(time, delta) {
        this.hudText.setText('Day ' + this.state.day + ' ' + this.state.clockText());

        if (!this.scene.isPaused('GameScene')) {
            this.state.regenMP(delta);
        }

        const hpRatio = this.state.hp / this.state.maxHP;
        const mpRatio = this.state.mp / this.state.maxMP;
        this.hpFill.setCrop(0, 0, Math.floor(bar_width * hpRatio), 5);
        this.mpFill.setCrop(0, 0, Math.floor(bar_width * mpRatio), 5);

        if (Phaser.Input.Keyboard.JustDown(this.skillKeys.J))
            this.useSkill(0);
        if (Phaser.Input.Keyboard.JustDown(this.skillKeys.K))
            this.useSkill(1);
        if (Phaser.Input.Keyboard.JustDown(this.skillKeys.L))
            this.useSkill(2);

        for (let i = 0; i < SKILLS.length; i++) {
            const learned = this.learned.has(SKILLS[i].id);
            this.skillIcons[i].setVisible(learned);
            this.skillLocks[i].setVisible(!learned);
            if (learned && this.state.mp < SKILLS[i].cost) {
                this.skillIcons[i].setAlpha(0.35);
            } else {
                this.skillIcons[i].setAlpha(1);
            }
        }
    }
}