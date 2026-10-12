import dice = require("./Dice");
import { Speed } from "./Speed";

export function countHoard(coins: number[]): number {
    let hoard = 0;
    for (const coin of coins) {
        if (coin > 0) {
            hoard += coin;
        }
    }
    return hoard + new dice.Dice(6).roll().value + new Speed(0).getSpeed();
}
