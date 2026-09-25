import { CreatureUtil } from "../../application/index.js";

export class ArmorClass {
    constructor(base, bonus, description = CreatureUtil.STANDARD_ARMOR_CLASS_DESCRIPTION) {
        this.description = description;
        this.base = base;
        this.bonus = bonus;
        this.total = base + bonus;
    }

    getBase() {
        return this.base;
    }

    getBonus() {
        return this.bonus;
    }

    getTotal() {
        return this.total;
    }
}
