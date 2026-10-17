import { Component } from '@angular/core';
import { Zentaurenhöhle } from '../domain/model/zentaurenhoehle';
import { ArmorClassPipe } from './pipes/armor-class.pipe';

@Component({
  selector: 'cc-zentaurenhoehle-panel',
  standalone: true,
  imports: [ArmorClassPipe],
  templateUrl: './zentaurenhoehle-panel.component.html',
})
export class ZentaurenhoehlePanelComponent {
  readonly höhle = new Zentaurenhöhle(14);
}
