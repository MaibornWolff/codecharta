import { ArmorClass } from './armor-class';

export interface Fightable {
  readonly armorClass: ArmorClass;
  attack(target: Fightable): number;
}
