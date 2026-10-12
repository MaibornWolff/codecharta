import { Dice } from "../../domain/model/Dice.js";

export function LairGate({ sides }) {
    if (sides > 20) {
        return <p>closed</p>;
    }
    return <p>{new Dice(sides).roll().value}</p>;
}
