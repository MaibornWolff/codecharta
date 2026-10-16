import { Component, Input } from '@angular/core';
import { RollPipe } from './pipes/dice/roll.pipe';
import { SpeedBadgeComponent } from './speed-badge.component';

// An inline template: what it uses reaches the dependency lens only through the imports of this file
@Component({
  selector: 'cc-treasure-chest',
  standalone: true,
  imports: [RollPipe, SpeedBadgeComponent],
  template: `
    <p>Counts the treasure hoard a creature guards: {{ gold | roll }}</p>
    <cc-speed-badge />
  `,
})
export class TreasureChestComponent {
  @Input() gold = 0;
}
