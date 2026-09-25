import { Speed } from "./Speed.js";

export class Movement {
    constructor(private readonly speed: Speed) {}

    distancePerRound(rounds: number): number {
        return this.speed.getSpeed() * rounds;
    }
}
