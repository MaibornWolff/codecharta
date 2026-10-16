import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Creature } from '../domain/model/creature';
import { HitPointsPipe } from './pipes/hit-points.pipe';
import { SpeedBadgeComponent } from './speed-badge.component';

@Component({
  selector: 'cc-creature-list',
  standalone: true,
  imports: [SpeedBadgeComponent, HitPointsPipe],
  templateUrl: './creature-list.component.html',
})
export class CreatureListComponent {
  @Input() creatures: Creature[] = [];
  @Output() selected = new EventEmitter<Creature>();
}
