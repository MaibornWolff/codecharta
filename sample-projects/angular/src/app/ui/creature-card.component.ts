import { TitleCasePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Creature } from '../domain/model/creature';
import { GlowDirective } from './glow.directive';
import { ArmorClassPipe } from './pipes/armor-class.pipe';
import { RollPipe } from './pipes/dice/roll.pipe';
import { HitPointsPipe } from './pipes/hit-points.pipe';
import { SpeedBadgeComponent } from './speed-badge.component';

@Component({
  selector: 'cc-creature-card',
  standalone: true,
  imports: [TitleCasePipe, GlowDirective, ArmorClassPipe, RollPipe, HitPointsPipe, SpeedBadgeComponent],
  templateUrl: './creature-card.component.html',
})
export class CreatureCardComponent {
  @Input({ required: true }) creature!: Creature;
  resting = false;

  onDash(): void {
    this.resting = false;
  }
}
