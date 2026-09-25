import { Creature } from "./Creature";
import { CreatureId } from "./CreatureId";
import { CreatureType } from "./CreatureType";
import { SpeedType } from "./SpeedType";

export class Centaur extends Creature {
    constructor(id: CreatureId) {
        super(id, CreatureType.MONSTROSITY);
    }

    gallop(): number {
        const walkingSpeed = this.getSpeeds().get(SpeedType.WALKING);
        return (walkingSpeed?.getSpeed() ?? 0) * 2;
    }
}
