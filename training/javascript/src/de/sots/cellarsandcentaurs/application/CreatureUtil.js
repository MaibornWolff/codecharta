import * as model from "../domain/model/Creature.js";
import { Fightable } from "../domain/model/Fightable.js";

export class CreatureUtil {
    static STANDARD_ARMOR_CLASS_DESCRIPTION = "Natural Armor";

    /*
     * Counts the treasure hoard a creature guards.
     */
    static countHoard(creature) {
        return creature instanceof model.Creature ? creature.getHitPoints().max * 10 : 0;
    }
}
