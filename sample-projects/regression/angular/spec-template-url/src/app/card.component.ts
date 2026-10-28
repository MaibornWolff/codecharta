import { Component } from '@angular/core'
import { BadgeComponent } from './badge.component'

@Component({ selector: 'app-card', templateUrl: './card.component.html', standalone: true, imports: [BadgeComponent] })
export class CardComponent {}
