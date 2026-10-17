import { ArmorClass } from './armor-class';
import { CreatureType } from './creature-type';
import { Fightable } from './fightable';
import { HitPoints } from './hit-points';
import { Speed } from './speed';

/**
 * A creature that roams the cellar. Centaurs, beasts and dragons all share hit points, armor class and speeds.
 */
export class Creature implements Fightable {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly type: CreatureType,
    readonly hitPoints: HitPoints,
    readonly armorClass: ArmorClass,
    readonly speeds: Speed[],
    readonly nickname?: string,
    readonly d20Roll = 10,
  ) {}

  isWounded(): boolean {
    return this.hitPoints.current < this.hitPoints.maximum;
  }

  attack(target: Fightable): number {
    return target.armorClass.value;
  }
}
