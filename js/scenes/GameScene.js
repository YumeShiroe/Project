import { FUNGI } from '../data/fungi.js';
import { REGIONS } from '../data/region.js';
import { pixelText, smallPixelText } from '../ui/style.js';
import { MAPS } from '../data/maptravel.js';

const noSpawnTile = [4, 5];

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create(data) {
        const mapID = data.mapID || 'home';
        const spawnName = data.spawn || 'default';
        this.mapInfo = MAPS[mapID];

        this.map = this.make.tilemap({
            key: this.mapInfo.tilemap
        });

        const tiles = this.map.addTilesetImage(this.mapInfo.tileset, this.mapInfo.tilesetImage);
        this.groundLayer = this.map.createLayer('ground', tiles);
        if (this.map.getLayer('grass'))
            this.map.createLayer('grass', tiles);
        this.map.createLayer('decor', tiles);
        this.collisionLayer = this.map.createLayer('collision', tiles);

        const start = this.findSpawn(spawnName);
        this.player = this.physics.add.sprite(start.x, start.y, 'player', 0);
        this.speed = 60;
        this.facing = 'down';

        this.aboveLayer = this.map.createLayer('above', tiles);
        this.collisionLayer.setCollisionByExclusion([-1]);
        this.physics.add.collider(this.player, this.collisionLayer);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.player.setCollideWorldBounds(true);

        const cam = this.cameras.main;
        if (this.map.widthInPixels <= cam.width && this.map.heightInPixels <= cam.height) {
            cam.centerOn(this.map.widthInPixels / 2, this.map.heightInPixels / 2);
        } else {
            cam.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
            cam.startFollow(this.player);
        }
        cam.fadeIn(300, 0, 0, 0);

        this.hotbar = this.registry.get('hotbar');
        this.learned = this.registry.get('learned');

        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D');

        this.inventory = this.registry.get('inventory');
        this.fungiPickupReach = 20;
        this.keyE = this.input.keyboard.addKey('E');
        this.holdTime = 0;
        this.holdTarget = null;
        this.pointerHolding = null;
        this.createPickupPrompt();
        this.input.on('pointerup', () => {
            this.pointerHolding = null;
        });

        this.aboveLayer.setDepth(10000);
        this.fungiGroup = this.physics.add.staticGroup();
        if (this.mapInfo.region !== null) {
            this.spawnFungi(REGIONS[this.mapInfo.region]);
        }

        this.input.keyboard.on('keydown-I', () => {
            this.scene.launch('InventoryScene');
            this.scene.pause();
        });
        this.events.off('resume');
        this.events.on('resume', () => this.input.keyboard.resetKeys());

        const numberKeys = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'];
        for (let i = 0; i < numberKeys.length; i++) {
            this.input.keyboard.on('keydown-' + numberKeys[i], () => this.eatFromHotBar(i));
        }

        this.changingMap = false;
        this.createExits();
        this.createInteractions();
        this.events.off('menu-action');
        this.events.on('menu-action', (action) => this.onMenuAction(action));

        if (!this.scene.isActive('HotBarScene'))
            this.scene.launch('HotBarScene');
    }

    update(time, delta) {
        if (this.changingMap) {
            this.player.setVelocity(0, 0);
            return;
        }

        const left = this.cursors.left.isDown || this.keys.A.isDown;
        const right = this.cursors.right.isDown || this.keys.D.isDown;
        const up = this.cursors.up.isDown || this.keys.W.isDown;
        const down = this.cursors.down.isDown || this.keys.S.isDown;

        this.player.setDepth(this.player.y);

        let vx = 0;
        let vy = 0;

        if (left) vx = -1;
        else if (right) vx = 1;

        if (up) vy = -1;
        else if (down) vy = 1;

        this.player.setVelocity(vx, vy);
        this.player.body.velocity.normalize().scale(this.speed);

        if (vx !== 0) {
            this.player.anims.play('walk-side', true);
            this.player.setFlipX(vx < 0);
            this.facing = 'side';
        } else if (vy < 0) {
            this.player.anims.play('walk-up', true);
            this.facing = 'up';
        } else if (vy > 0) {
            this.player.anims.play('walk-down', true);
            this.facing = 'down';
        } else {
            this.player.anims.stop();
            const idleFrames = { down: 0, up: 3, side: 6 };
            this.player.setFrame(idleFrames[this.facing]);
        }
        this.updatePickup(delta);
        this.updateInteract();
    }

    pickWeighted(table) {
        let sum = 0;
        for (const id in table) {
            sum += table[id];
        }

        let roll = Math.random() * sum;
        for (const id in table) {
            roll -= table[id];
            if (roll < 0)
                return id;
        }
    }

    spawnFungi(region) {
        const used = new Set();
        let placed = 0;
        let tries = 0;

        while (placed < region.fungiCount && tries < 1000) {
            tries++;
            const tx = Phaser.Math.Between(1, this.map.width - 2);
            const ty = Phaser.Math.Between(1, this.map.height - 2);
            const key = tx + ',' + ty;

            if (used.has(key))
                continue;
            if (this.collisionLayer.getTileAt(tx, ty))
                continue;
            if (this.aboveLayer.getTileAt(tx, ty))
                continue;

            const groundTile = this.groundLayer.getTileAt(tx, ty);
            if (groundTile && noSpawnTile.includes(groundTile.index))
                continue;

            const x = tx * 16 + 8;
            const y = ty * 16 + 8;
            if (Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) < 48)
                continue;

            used.add(key);
            this.createFungus(this.pickWeighted(region.spawnTable), x, y);
            placed++;
        }
    }

    createFungus(id, x, y) {
        const data = FUNGI[id];
        const fungus = this.fungiGroup.create(x, y, 'fungi', data.frame);
        fungus.fungusId = id;
        fungus.setDepth(y);

        if (data.glow !== null) {
            const glow = fungus.preFX.addGlow(data.glow, 4, 0);
            this.tweens.add ({
                targets: glow,
                outerStrength: 1,
                duration: 900,
                yoyo: true,
                repeat: -1
            });
        }

        fungus.setInteractive();
        fungus.on('pointerdown', () => {
            this.pointerHolding = fungus;
        });

        return fungus;
    }

    nearestPickupableFungus() {
        let best = null;
        let bestDistance = this.fungiPickupReach;
        const list = this.fungiGroup.getChildren();

        for (let i = 0; i < list.length; i++) {
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, list[i].x, list[i].y);
            if (distance <= bestDistance) {
                best = list[i];
                bestDistance = distance;
            }
        }
        return best;
    }

    fungusPickup(fungus) {
        const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, fungus.x, fungus.y);
        if (distance > this.fungiPickupReach) {
            return;
        }
        const id = fungus.fungusId;
        if (!this.inventory.addItem(id))
            return;

        const label = this.add.text(fungus.x, fungus.y - 8, '+1 ' + FUNGI[id].name, {
            ...pixelText,
            stroke: '#181425',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(20000);

        this.tweens.add({
            targets: label,
            y: label.y - 14,
            alpha: 0,
            duration: 900,
            onComplete: () => label.destroy()
        });

        fungus.destroy();
    }

    createPickupPrompt() {
        this.prompt = this.add.container(0, 0).setDepth(20000).setVisible(false);

        const background = this.add.graphics();
        background.fillStyle(0x181425, 0.85);
        background.fillRoundedRect(-26, -9, 52, 18, 4);
        background.lineStyle(1, 0xc0cbdc, 1);
        background.strokeRoundedRect(-26, -9, 52, 18, 4);

        this.promptRing = this.add.graphics();

        const key = this.add.text(-17, 0, 'E', pixelText).setOrigin(0.5);

        this.promptLabel = this.add.text(-8, 0, 'Hold', {
            ...pixelText,
            color: '#c0cbdc',
        }).setOrigin(0, 0.5);

        this.prompt.add([background, this.promptRing, key, this.promptLabel]);
    }

    drawPromptRing(progress) {
        this.promptRing.clear();
        this.promptRing.lineStyle(2, 0x3a4466, 1);
        this.promptRing.strokeCircle(-17, 0, 6);

        if (progress > 0) {
            this.promptRing.lineStyle(2, 0xfee761, 1);
            this.promptRing.beginPath();
            this.promptRing.arc(-17, 0, 6, Phaser.Math.DegToRad(-90), Phaser.Math.DegToRad(-90 +  360 * progress), false);
            this.promptRing.strokePath();
        }
    }

    updatePickup(delta) {
        const target = this.nearestPickupableFungus();

        if (target !== this.holdTarget) {
            this.holdTarget = target;
            this.holdTime = 0;
        }

        if (!target) {
            this.prompt.setVisible(false);
            return false;
        }
        this.prompt.setVisible(true);
        this.prompt.setPosition(target.x, target.y - 16);

        const hasEnoughRoom = this.inventory.ableToAdd(target.fungusId);
        if (hasEnoughRoom) {
            this.promptLabel.setText('Hold');
        } else {
            this.promptLabel.setText('Full');
        }
        if (!hasEnoughRoom) {
            this.holdTime = 0;
            this.drawPromptRing(0);
            return;
        }

        const holding = this.keyE.isDown || this.pointerHolding === target;
        if (holding) {
            this.holdTime += delta;
        } else {
            this.holdTime = 0;
        }

        const needed = 400 + FUNGI[target.fungusId].rank * 100;
        const progress = Math.min(this.holdTime / needed, 1);
        this.drawPromptRing(progress);

        if (progress >= 1) {
            this.fungusPickup(target);
            this.holdTarget = null;
            this.holdTime = 0;
            this.prompt.setVisible(false);
        }
    }

    eatFromHotBar(index) {
        const id = this.hotbar.slots[index];
        if (id === null) {
            return;
        }
        if (this.inventory.countOf(id) === 0)
            return;

        const data = FUNGI[id];
        const above = this.player.y - 14;

        if (data.usage === 'permanent') {
            if (this.learned.has(id)) {
                this.floatingText(this.player.x, above, 'Already eaten');
                return;
            }
            this.learned.add(id);
        }

        this.inventory.consume(id);
        this.floatingText(this.player.x, above, 'Ate ' + data.name);
        this.applyFungusEffect(id);
    }

    applyFungusEffect(id) {
        // Nothing for now since ability will be added later
    }

    findSpawn(name) {
        const layer = this.map.getObjectLayer('spawns');
        if (layer) {
            for (let i = 0; i < layer.objects.length; i++) {
                if (layer.objects[i].name === name) {
                    return {
                        x: layer.objects[i].x,
                        y: layer.objects[i].y
                    };
                }
            }
        }
        return {
            x: this.map.widthInPixels / 2,
            y: this.map.heightInPixels / 2
        };
    }

    readProperty(object) {
        const props = {};
        if (object.properties) {
            for (let i = 0; i < object.properties.length; i++) {
                props[object.properties[i].name] = object.properties[i].value;
            }
        }
        return props
    }

    createExits() {
        const layer = this.map.getObjectLayer('exits');
        if (!layer)
            return;
        for (let i = 0; i < layer.objects.length; i++) {
            const object = layer.objects[i];
            const props = this.readProperty(object);
            const zone = this.add.zone(object.x, object.y, object.width, object.height).setOrigin(0);
            this.physics.add.existing(zone, true);
            this.physics.add.overlap(this.player, zone, () => this.changeMap(props.target, props.spawn));
        }
    }

    changeMap(target, spawn) {
        if (this.changingMap || !MAPS[target])
            return;
        this.changingMap = true;
        this.cameras.main.fadeOut(300, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.restart({ 
                mapID: target,
                spawn: spawn
            });
        });
    }

    createInteractions() {
        this.interactions = [];
        const layer = this.map.getObjectLayer('interact');
        if (layer) {
            for (let i = 0; i < layer.objects.length; i++) {
                const object = layer.objects[i];
                const props = this.readProperty(object);
                this.interactions.push({
                    rect: new Phaser.Geom.Rectangle(object.x, object.y, object.width, object.height),
                    action: props.action,
                    label: props.label || 'Enter'
                });
            }
        }

        this.interactPrompt = this.add.text(0, 0, '', {
            ...pixelText,
            stroke: '#181425',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(20000).setVisible(false);    
    }

    updateInteract() {
        let curr = null;
        for (let i = 0; i < this.interactions.length; i++) {
            if (Phaser.Geom.Rectangle.Contains(this.interactions[i].rect, this.player.x, this.player.y)) {
                curr = this.interactions[i];
            }
        }

        if (curr === null) {
            this.interactPrompt.setVisible(false);
            return;
        }

        this.interactPrompt.setText('E ' + curr.label);
        this.interactPrompt.setPosition(this.player.x, this.player.y - 16);
        this.interactPrompt.setVisible(true);

        if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
            this.doAction(curr.action);
        }
    }

    doAction(action) {
        if (action === 'castleMenu') {
            this.openMenu('Fortress', [
                {
                    label: 'Guild',
                    action: 'guild'
                },
                {
                    label: 'Shop',
                    action: 'shop',
                },
                {
                    label: 'Leave',
                    action: 'leave'
                }
            ]);
        } else if (action === 'roadClosed') {
            this.floatingText(this.player.x, this.player.y - 16, 'The road is being maintained');
        }
    }

    openMenu(title, option) {
        this.interactPrompt.setVisible(false);
        this.scene.launch('MenuScene', {
            title: title,
            options: option
        });
        this.scene.pause();
    }

    onMenuAction(action) {
        if (action === 'guild' || action === 'shop') {
            this.floatingText(this.player.x, this.player.y - 16, 'Coming Soon');
        }
    }

    floatingText(x, y, text) {
        const label = this.add.text(x, y, text, {
            ...pixelText,
            stroke: '#181425',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(20000);

        this.tweens.add({
            targets: label,
            y: y -14,
            alpha: 0,
            duration: 900,
            onComplete: () => label.destroy()
        });
    }

}