import * as model from "../domain/model/Creature";
import { Fightable } from "../domain/model/Fightable";

export class CreatureUtil {
    static readonly STANDARD_ARMOR_CLASS_DESCRIPTION = "Natural Armor";

    /*
     * Counts the treasure hoard a creature guards.
     */
    static countHoard(creature: unknown): number {
        return creature instanceof model.Creature ? (creature.getHitPoints()?.max ?? 0) * 10 : 0;
    }
}
