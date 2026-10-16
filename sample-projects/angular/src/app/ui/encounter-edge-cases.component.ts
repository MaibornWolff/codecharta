import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Creature } from '../domain/model/creature';
import { TreasureChestComponent } from './treasure-chest.component';

@Component({
  selector: 'cc-encounter-edge-cases',
  standalone: true,
  imports: [NgIf, FormsModule, MatIconModule, TreasureChestComponent],
  templateUrl: './encounter-edge-cases.component.html',
})
export class EncounterEdgeCasesComponent {
  treasure = { gold: 120 };
  count = 2;
  creature?: Creature;
  hidden = false;
  deep = { a: true, b: true, c: false };

  rename(name: string): void {
    console.log(name);
  }

  onResize(): void {
    console.log('the cellar resized');
  }
}
