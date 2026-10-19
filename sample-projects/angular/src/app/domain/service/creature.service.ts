import { Injectable } from '@angular/core';
import { Creature } from '../model/creature';

@Injectable({ providedIn: 'root' })
export class CreatureService {
  private readonly stable = new Map<string, Creature>();

  save(creature: Creature): Creature {
    this.stable.set(creature.id, creature);
    return creature;
  }

  all(): Creature[] {
    return [...this.stable.values()];
  }
}
