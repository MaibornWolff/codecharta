import { Component } from '@angular/core'
import { CardStyleDirective } from '../shared/card-style.directive'
import { TileStyleDirective } from '../shared/tile-style.directive'

@Component({ selector: 'app-panel', templateUrl: './panel.component.html', standalone: true, imports: [CardStyleDirective, TileStyleDirective] })
export class PanelComponent {
  tiled = false
}
