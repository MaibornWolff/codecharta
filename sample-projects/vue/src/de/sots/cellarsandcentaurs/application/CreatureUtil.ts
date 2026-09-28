import * as model from '../domain/model/Creature'
import { Fightable } from '../domain/model/Fightable'

export class CreatureUtil {
  static readonly STANDARD_ARMOR_CLASS_DESCRIPTION: string = 'Natural Armor'

  /*
   * Counts the treasure hoard a creature guards.
   */
  static countHoard(creature: model.Creature): number {
    return (creature.getHitPoints()?.max ?? 0) * 10
  }
}
