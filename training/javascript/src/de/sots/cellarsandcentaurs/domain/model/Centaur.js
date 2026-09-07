import { Creature } from "./Creature.js";
import { CreatureType } from "./CreatureType.js";
import { SpeedType } from "./SpeedType.js";

export class Centaur extends Creature {
    constructor(id) {
        super(id, CreatureType.MONSTROSITY);
    }

    gallop() {
        const walkingSpeed = this.getSpeeds().get(SpeedType.WALKING);
        return walkingSpeed.getSpeed() * 2;
    }
}
