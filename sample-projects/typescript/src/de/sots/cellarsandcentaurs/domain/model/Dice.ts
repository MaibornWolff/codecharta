export class DiceRoll {
    constructor(
        readonly sides: number,
        readonly value: number,
    ) {}
}

export class Dice {
    constructor(private readonly sides: number) {}

    roll(): DiceRoll {
        const value = Math.floor(Math.random() * this.sides) + 1;
        return new DiceRoll(this.sides, value);
    }
}

export function rollD20(): number {
    const d20Roll = new Dice(20).roll();
    return d20Roll.value;
}
