import { FUNGI } from '../data/fungi.js';
import { bountyCount, BOUNTY_POOL, BONUS_MAX, BONUS_MIN } from '../data/bounty.js';

export default class GameState {
    constructor() {
        this.day = 1;
        this.time = 0;
        this.dayLength = 300000;
        this.baseCost = 100;
        this.costGrowth = 50;
        this.costOverdue = 0;
        this.overdueDays = 0;
        this.maxOverdueDays = 3;
        this.paidToday = false;

        this.bounties = [];
        this.fungiByMap = {};
        this.inventoryLevel = 0;
        this.generateBounties();

        this.maxHP = 100;
        this.maxMP = 50;
        this.hp = this.maxHP;
        this.mp = this.maxMP;
        this.mpRegen = 2;
        this.hpRegen = 1;
    }

    todayCost() {
        return this.baseCost + (this.day - 1) * this.costGrowth;
    }

    amountDue() {
        if (this.paidToday)
            return this.costOverdue;
        return this.todayCost() + this.costOverdue;
    }

    nextDay() {
        if (this.paidToday === false) {
            this.costOverdue += this.todayCost();
            this.overdueDays += 1;
        }
        if (this.overdueDays === this.maxOverdueDays) 
            return false;
        this.day++;
        this.time = 0;
        this.hp = this.maxHP;
        this.mp = this.maxMP;
        this.paidToday = false;
        this.generateBounties();
        return true;
    }

    clockText() {
        const minute = Math.floor(360 + this.time * 1080);
        const hour = Math.floor(minute / 60);
        const m = minute % 60;
        return String(hour).padStart(2, '0') + ':' + String(m).padStart(2, '0');
    }

    generateBounties() {
        this.bounties = [];
        const pool = BOUNTY_POOL.slice();
        const amount = bountyCount(this.day);

        for (let i = 0; i < amount && pool.length > 0; i++) {
            let sum = 0;
            for (let j = 0; j < pool.length; j++) {
                sum += pool[j].weight;
            }

            let gacha = Math.random() * sum;
            let pick = 0;
            for (let j = 0; j < pool.length; j++) {
                gacha -= pool[j].weight;
                if (gacha < 0) {
                    pick = j;
                    break;
                }
            }

            const entry = pool.splice(pick, 1)[0];
            const count = Phaser.Math.Between(entry.min, entry.max);
            const midMan = Phaser.Math.FloatBetween(entry.middleManMin, entry.middleManMax);
            const bonus = Phaser.Math.FloatBetween(BONUS_MIN, BONUS_MAX);
            this.bounties.push({
                id: entry.id,
                count: count,
                reward: Math.round(FUNGI[entry.id].value * count * bonus * (1 - midMan)),
                done: false
            });
        }
    }

    turnInBounty(index, inventory) {
        const bounty = this.bounties[index];
        if (bounty.done) {
            return false;
        }

        if (!inventory.consume(bounty.id, bounty.count))
            return false;

        inventory.coins += bounty.reward;
        inventory.changed();
        bounty.done = true;
        return true;
    }

    spendMP(cost) {
        if (this.mp < cost)
            return false;
        this.mp -= cost;
        return true;
    }

    regenMP(delta) {
        this.mp = Math.min(this.maxMP, this.mp + this.mpRegen * delta / 1000);
    }

    regenHP(delta) {
        this.hp = Math.min(this.maxHP, this.hp + this.hpRegen * delta / 1000)
    }
}