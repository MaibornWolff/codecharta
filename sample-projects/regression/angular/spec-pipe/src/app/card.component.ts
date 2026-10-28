import { Component } from '@angular/core'
import { MoneyPipe } from '../shared/money.pipe'

@Component({ selector: 'app-card', templateUrl: './card.component.html', standalone: true, imports: [MoneyPipe] })
export class CardComponent {
  price = 1
}
