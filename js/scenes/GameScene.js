import { FUNGI } from '../data/fungi.js';
import { REGIONS } from '../data/region.js';
import { pixelText, smallPixelText } from '../ui/style.js';
import { MAPS } from '../data/maptravel.js';
import RockMonster from '../features/rockMonster.js';

const noSpawnTile = [4, 5];

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create(data) {
        const mapID = data.mapID || 'home';
        this.mapID = mapID;
        const spawnName = data.spawn || 'default';
        this.mapInfo = MAPS[mapID];
        this.state = this.registry.get('state');

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

        this.invincibleUntil = 0;
        this.knockbackUntil = 0;

        this.aboveLayer = this.map.createLayer('above', tiles);
        this.collisionLayer.setCollisionByExclusion([-1]);
        this.physics.add.collider(this.player, this.collisionLayer);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.player.setCollideWorldBounds(true);

        if (this.map.getLayer('blocked')) {
            const blocked = this.map.createLayer('blocked', tiles).setVisible(false);
            blocked.setCollisionByExclusion([-1]);
            this.physics.add.collider(this.player, blocked);
        }

        this.monsters = this.physics.add.group();
        this.physics.add.collider(this.monsters, this.collisionLayer);
        this.physics.add.overlap(this.player, this.monsters, (player, monster) => {
            if (!monster.dead)
                this.takeDamage(10, monster.x, monster.y);
        });

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
            this.setupFungi();
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

        this.nightOverlay = this.add.rectangle(0, 0, 480, 270, 0x0b0d2b).setOrigin(0).setScrollFactor(0).setDepth(15000).setAlpha(0);
        this.updateNight();

        this.input.keyboard.on('keydown-N', () => {
            this.state.time = 0.9;
        });
        this.input.keyboard.on('keydown-M', () => {
            this.inventory.coins += 100;
            this.inventory.changed();
        });
        this.input.keyboard.on('keydown-H', () => {
            this.takeDamage(10, this.player.x + 10, this.player.y);
        });
        this.input.keyboard.on('keydown-R', () => {
            this.monsters.add(new RockMonster(this, this.player.x + 60, this.player.y));
        });
        this.input.keyboard.on('keydown-T', () => {
            this.monsters.children.each(m => m.takeDamageMonster(1, this.player.x, this.player.y));
        });

        this.changingMap = false;
        this.createExits();
        this.createInteractions();
        this.events.off('menu-action');
        this.events.on('menu-action', (action) => this.onMenuAction(action));

        this.events.off('use-skill');
        this.events.on('use-skill', (index) => {
            if (index === 0) {
                this.castSkillForce();
            }
        })

        if (!this.scene.isActive('HotBarScene'))
            this.scene.launch('HotBarScene');

        if (data.message) {
            this.time.delayedCall(400, () => this.floatingText(this.player.x, this.player.y - 16, data.message));
        }
    }

    update(time, delta) {
        if (this.changingMap) {
            this.player.setVelocity(0, 0);
            return;
        }
        if (this.time.now < this.knockbackUntil)
            return;
        if (this.state.time < 1) {
            this.state.time = Math.min(1, this.state.time + delta / this.state.dayLength);
        } else if (!this.lateWarned) {
            this.lateWarned = true;
            this.floatingText(this.player.x, this.player.y, "It's late...I need to sleep");
        }
        this.updateNight();

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
        let speed = this.speed;
        if (this.learned.has('swift')) {
            speed = this.speed * 1.4;
        }
        this.player.body.velocity.normalize().scale(speed);

        if (this.learned.has('regeneration')) {
            this.state.regenHP(delta);
        }

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
        this.monsters.children.iterate(monster => {
            monster.spot(this.player);
            monster.setDepth(monster.y);
        })
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
        const list = [];
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
            list.push({
                id: this.pickWeighted(region.spawnTable), 
                x: x,
                y: y
            });
            placed++;
        }
        return list;
    }

    setupFungi() {
        let saved = this.state.fungiByMap[this.mapID];
        if (!saved || saved.day !== this.state.day) {
            saved = {
                day: this.state.day,
                list: this.spawnFungi(REGIONS[this.mapInfo.region])
            };
            this.state.fungiByMap[this.mapID] = saved;
        }
        
        for (let i = 0; i < saved.list.length; i++) {
            const record = saved.list[i];
            const fungus = this.createFungus(record.id, record.x, record.y);
            fungus.record = record;
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

        const list = this.state.fungiByMap[this.mapID].list;
        const index = list.indexOf(fungus.record);
        if (index !== -1) {
            list.splice(index, 1);
        }
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
        let text = null;
        if (id === 'swift') {
            text = 'It feels like the wind is with you'
        } else if (id === 'protection') {
            this.state.maxHP += 50;
            this.state.hp += 50;
            text = 'Your skin is tougher. +50 Max Health';
        } else if (id === 'regeneration') {
            text = 'Your wounds begin to heal';
        } else if (id === 'force') {
            text = 'Learned Air Blast [J]';
        } else if (id === 'projection') {
            text = 'Learned Unstable Clone [K]';
        } else if (id === 'blitz') {
            text = 'Learned Flash [L]';
        } else if (id === 'luminous') {
            text = 'Darkness is no longer your enemy';
        }

        if (text) {
            this.time.delayedCall(600, () => this.floatingText(this.player.x, this.player.y - 16, text));
        }
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
                    action: 'enterShop',
                },
                {
                    label: 'Leave',
                    action: 'leave'
                }
            ]);
        } else if (action === 'roadClosed') {
            this.floatingText(this.player.x, this.player.y - 16, 'The road is being maintained');
        } else if (action === 'mom') {
            const due = this.state.amountDue();
            if (due === 0) {
                this.floatingText(this.player.x, this.player.y - 16, 'You could still sense her heartbeat' );
                return;
            }
            this.openMenu('Due: ' + due, [
                {
                    label: 'Pay ' + due, 
                    action: 'payMom'
                },
                {
                    label: 'Leave',
                    action: 'leave'
                }
            ]);
        } else if (action === 'sleep') {
            this.openMenu('dream is calling', [
                {
                    label: 'Sleep',
                    action: 'sleep'
                },
                {
                    label: 'Nuh uh',
                    action: 'leave'
                }
            ]);
        } else if (action === 'bounties') {
            this.interactPrompt.setVisible(false);
            this.scene.launch('BountyScene');
            this.scene.pause();
        } else if (action === 'shopkeeper') {
            this.openShop();
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
        if (action === 'guild') {
            this.changeMap('guildHall', 'fromCastle');
        } else if (action === 'payMom') {
            this.payMom()
        } else if (action === 'sleep') {
            this.sleep(false);
        } else if (action === 'enterShop') {
            this.changeMap('shop', 'fromCastle');
        } else if (action === 'buyInventory') {
            this.buyInventory();
        }
            
    }

    updateNight() {
        let darkness = 0;
        if (this.state.time > 0.6) {
            darkness = (this.state.time - 0.6) / 0.4 * 0.6;
        }
        this.nightOverlay.setAlpha(darkness);
    }

    payMom() {
        const due = this.state.amountDue();
        if (this.inventory.coins < due) {
            this.floatingText(this.player.x, this.player.y - 16, "Bro you don't have enough :sob:");
            return;
        }
        this.inventory.coins -= due;
        this.inventory.changed();
        this.state.costOverdue = 0;
        this.state.overdueDays = 0;
        this.state.paidToday = true;
        this.floatingText(this.player.x, this.player.y - 16, 'Paid ' + due);
    }

    sleep(passedOut) {
        if (this.changingMap)
            return;
        this.changingMap = true;
        const stillAlive = this.state.nextDay();

        this.cameras.main.fadeOut(600, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            if (!stillAlive) {
                this.scene.stop('HotBarScene');
                this.scene.start('GameOverScene');
                return;
            }
            let message = "Wakey! Waky! It's day " + this.state.day;
            if (passedOut) 
                message = 'You was embraced by dreams...';
            this.scene.restart({
                mapID: 'home',
                spawn: 'bed',
                message: message
            });
        })
    }

    inventoryPrice() {
        return 100 * (this.state.inventoryLevel + 1);
    }

    openShop() {
        const options = [];
        if (this.inventory.unlockedInventorySlots < this.inventory.totalInventorySlots) {
            options.push({
                label: 'Inventory ' + this.inventoryPrice() + 'G',
                action: 'buyInventory'
            });
        }
        options.push({
            label: 'Leave',
            action: 'leave'
        });
        this.openMenu('shop', options);
    }

    buyInventory() {
        const price = this.inventoryPrice();
        if (this.inventory.coins < price) {
            this.floatingText(this.player.x, this.player.y - 16, 'Not Enough Gold');
            return;
        }
        this.inventory.coins -= price;
        this.inventory.unlockSlot(2);
        this.inventory.changed();
        this.state.inventoryLevel++;
        this.floatingText(this.player.x, this.player.y - 16, '+2 Slots');
    }

    takeDamage(amount, fromX, fromY) {
        if (this.changingMap)
            return;
        if (this.time.now < this.invincibleUntil)
            return;
        this.state.hp = Math.max(0, this.state.hp - amount);
        this.invincibleUntil = this.time.now + 1000;
        this.knockbackUntil = this.time.now + 150;

        const angle = Phaser.Math.Angle.Between(fromX, fromY, this.player.x, this.player.y);
        this.player.setVelocity(Math.cos(angle) * 160, Math.sin(angle) * 160);
        this.cameras.main.shake(100, 0.005);
        this.player.setTint(0xff0044);
        this.time.delayedCall(100, () => this.player.clearTint());

        this.tweens.add({
            targets: this.player,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 4,
            onComplete: () => this.player.setAlpha(1)
        });

        if (this.state.hp <= 0) {
            this.faint();
        }
    }

    throwRock(fromX, fromY, toX, toY) {
        const shadow = this.add.image(fromX, fromY, 'rock-shadow').setDepth(1);
        const rock = this.add.image(fromX, fromY - 12, 'rock').setDepth(9000);
        const height = 40;

        this.tweens.addCounter({
            from: 0,
            to: 1,
            duration: 900,
            onUpdate: (tween) => {
                const t = tween.getValue();
                const x = Phaser.Math.Linear(fromX, toX, t);
                const y = Phaser.Math.Linear(fromY, toY, t);
                const arc = 4 * height * t * (1 - t);
                shadow.setPosition(x, y);
                rock.setPosition(x, y - 12 * (1 - t) - arc);
                rock.setAngle(t * 360);
            },
            onComplete: () => {
                shadow.destroy();
                rock.destroy();
                this.cameras.main.shake(60, 0.003);
                const distance = Phaser.Math.Distance.Between(toX, toY, this.player.x, this.player.y);
                if (distance < 12)
                    this.takeDamage(20, toX, toY);
            }
        });
    }

    faint() {
        this.state.hp = this.state.maxHP;
        this.sleep(true);
    }

    canCastSkill(id, cost) {
        if (!this.learned.has(id)) {
            this.floatingText(this.player.x, this.player.y - 16, 'Not Learned');
            return false;
        }
        if (!this.state.spendMP(cost)) {
            this.floatingText(this.player.x, this.player.y - 16, 'Not Enough Energy');
            return false;
        }
        return true;
    }

    castSkillForce() {
        if (!this.canCastSkill('force', 10))
            return;
        const direction = this.facingVector();
        const startX = this.player.x + direction.x * 10;
        const startY = this.player.y + direction.y * 10;

        const blast = this.add.sprite(startX, startY, 'force-blast').setDepth(9000).setRotation(Math.atan2(direction.y, direction.x));
        blast.play('force-blast');

        const hit = new Set();
        this.tweens.add({
            targets: blast,
            x: startX + direction.x * 60,
            y: startY + direction.y * 60,
            duration: 330,
            onUpdate: () => {
                this.monsters.children.each(monster => {
                    if (monster.dead || hit.has(monster))
                        return;
                    if (Phaser.Math.Distance.Between(blast.x, blast.y, monster.x, monster.y) < 18) {
                        hit.add(monster);
                        monster.takeDamageMonster(3, this.player.x, this.player.y);
                    }
                });
            },
            onComplete: () => blast.destroy()
        });
    }

    facingVector() {
        if (this.facing === 'up') {
            return {
                x: 0,
                y: -1
            };
        }
        if (this.facing === 'down') {
            return {
                x: 0,
                y: 1
            }
        }
        if (this.player.flipX) {
            return {
                x: -1,
                y: 0
            }
        }
        return {
            x: 1,
            y: 0
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