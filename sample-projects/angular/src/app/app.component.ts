import { UpperCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Creature } from './domain/model/creature';
import { CreatureService } from './domain/service/creature.service';
import { CreatureCardComponent } from './ui/creature-card.component';
import { CreatureListComponent } from './ui/creature-list.component';
import { EncounterEdgeCasesComponent } from './ui/encounter-edge-cases.component';
import { EncounterResolverComponent } from './ui/encounter-resolver.component';
import { ZentaurenhoehlePanelComponent } from './ui/zentaurenhoehle-panel.component';

@Component({
  selector: 'cc-root',
  standalone: true,
  imports: [
    UpperCasePipe,
    RouterOutlet,
    CreatureListComponent,
    CreatureCardComponent,
    ZentaurenhoehlePanelComponent,
    EncounterResolverComponent,
    EncounterEdgeCasesComponent,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
  readonly title = 'Cellars and Centaurs';
  readonly creatures = inject(CreatureService).all();
  selected?: Creature;

  select(creature: Creature): void {
    this.selected = creature;
  }
}
