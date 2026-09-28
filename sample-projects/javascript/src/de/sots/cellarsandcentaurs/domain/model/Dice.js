export class DiceRoll {
    constructor(sides, value) {
        this.sides = sides;
        this.value = value;
    }
}

export class Dice {
    constructor(sides) {
        this.sides = sides;
    }

    roll() {
        const value = Math.floor(Math.random() * this.sides) + 1;
        return new DiceRoll(this.sides, value);
    }
}

export function rollD20() {
    const d20Roll = new Dice(20).roll();
    return d20Roll.value;
}
