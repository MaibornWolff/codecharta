import { Component } from '@angular/core'
import { BadgeComponent } from '../shared/badge.component'
import { HighlightDirective } from '../shared/highlight.directive'
import { TooltipDirective } from '../shared/tooltip.directive'

@Component({ selector: 'app-card', templateUrl: './card.component.html', standalone: true, imports: [BadgeComponent, HighlightDirective, TooltipDirective] })
export class CardComponent {}
