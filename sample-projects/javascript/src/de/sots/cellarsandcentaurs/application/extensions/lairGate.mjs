import { Dice } from "../../domain/model/Dice.js";

export function closeGate(sides) {
    if (sides > 20) {
        return 20;
    }
    return new Dice(sides).roll().value;
}
