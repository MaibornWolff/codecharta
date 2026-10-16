import { Component, Input } from '@angular/core';
import { RollPipe } from './pipes/dice/roll.pipe';
import { SpeedBadgeComponent } from './speed-badge.component';

// An inline template: its decisions, words and the components and pipes it uses count for this file
@Component({
  selector: 'cc-treasure-chest',
  standalone: true,
  imports: [RollPipe, SpeedBadgeComponent],
  template: `
    @if (gold > 100) {
      <p>Counts the treasure hoard a creature guards: {{ gold | roll }}</p>
    }
    <cc-speed-badge />
  `,
})
export class TreasureChestComponent {
  @Input() gold = 0;
}
