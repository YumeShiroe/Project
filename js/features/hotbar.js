export default class Hotbar {
    constructor(inventory, size = 5) {
        this.inventory = inventory;
        this.slots = [];
        for (let i = 0; i < size; i++) {
            this.slots.push(null);
        }
        this.events = new Phaser.Events.EventEmitter();
    }

    assignFungus(index, id) {
        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i] === id)
                this.slots[i] = null;
        }
        this.slots[index] = id;
        this.events.emit('changed');
    }

    clear(index) {
        this.slots[index] = null;
        this.events.emit('changed');
    }

    countAt(index) {
        const id = this.slots[index];
        if (id === null) 
            return 0;
        return this.inventory.countOf(id);
    }
}