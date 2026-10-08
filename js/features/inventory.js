export default class Inventory {
    constructor(totalInventorySlots = 21, unlockedInventorySlots = 5, stackSize = 10) {
        this.totalInventorySlots = totalInventorySlots;
        this. unlockedInventorySlots = unlockedInventorySlots;
        this.stackSize = stackSize;
        this.coins = 0;

        this.slots = [];
        for (let i = 0; i < totalInventorySlots; i++) {
            this.slots.push(null);
        }
    }

    ableToAdd(id) {
        for (let i = 0; i < this.unlockedInventorySlots; i++) {
            const slot = this.slots[i];
            if (slot === null)
                return true;
            if (slot.id === id && slot.count < this.stackSize)
                return true;
        }
        return false;
    }

    addItem(id) {
        for (let i = 0; i < this.unlockedInventorySlots; i++) {
            const slot = this.slots[i];
            if (slot !== null && slot.id === id && slot.count < this.stackSize) {
                slot.count++;
                return true;
            }
        }

        for (let i = 0; i < this.unlockedInventorySlots; i++) {
            if (this.slots[i] === null) {
                this.slots[i] = {
                    id: id,
                    count: 1
                };
                return true;
            }
        }
        return false;
    }

    removeItemFromSlot(index, amount = 1) {
        const slot = this.slots[index];
        if (slot === null)
            return;
        slot.count -= amount;
        if (slot.count <= 0)
            this.slots[index] = null;
    }

    countOf(id) {
        let sum = 0;
        for (let i = 0; i < this.totalInventorySlots; i++) {
            const slot = this.slots[i];
            if(slot !== null && slot.id === id) {
                sum += slot.count;
            }
        }
        return sum;
    }

    isUsedSlots() {
        let used = 0;
        for (let i = 0; i < this.unlockedInventorySlots; i++) {
            if (this.slots[i] !== null)
                used++;
        }
        return used;
    }

    unlockSlot() {
        this.unlockedInventorySlots = Math.min(this.totalInventorySlots, this.unlockedInventorySlots + amount);
    }
}