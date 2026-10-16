import { Creature } from './creature';

export class Centaur extends Creature {
  gallop(): number {
    return this.speeds.reduce((fastest, speed) => Math.max(fastest, speed.feet), 0);
  }
}
