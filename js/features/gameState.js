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
        this.paidToday = false;
        return true;
    }

    clockText() {
        const minute = Math.floor(360 + this.time * 1080);
        const hour = Math.floor(minute / 60);
        const m = minute % 60;
        return String(hour).padStart(2, '0') + ':' + String(m).padStart(2, '0');
    }
}