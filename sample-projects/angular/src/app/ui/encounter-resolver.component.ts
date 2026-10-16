import { NgFor } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Creature } from '../domain/model/creature';

@Component({
  selector: 'cc-encounter-resolver',
  standalone: true,
  imports: [NgFor],
  templateUrl: './encounter-resolver.component.html',
})
export class EncounterResolverComponent {
  @Input() attacker!: Creature;
  @Input() defender?: Creature;
  @Input() roll = 0;
  @Input() bonus = 0;
  @Input() terrain = 'cellar';
  outcome: 'hit' | 'miss' | 'fumble' | 'undecided' = 'undecided';
  damage = 0;
  initiativeOrder: Creature[] = [];
}
