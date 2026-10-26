import { Component } from '@angular/core'
import { AriaDirective } from '../shared/aria.directive'
import { BigDirective } from '../shared/big.directive'
import { BindDirective } from '../shared/bind.directive'
import { ClickDirective } from '../shared/click.directive'
import { OnDirective } from '../shared/on.directive'
import { TwowayDirective } from '../shared/twoway.directive'
import { ValueDirective } from '../shared/value.directive'
import { WidthDirective } from '../shared/width.directive'

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  standalone: true,
  imports: [AriaDirective, BigDirective, BindDirective, ClickDirective, OnDirective, TwowayDirective, ValueDirective, WidthDirective]
})
export class FormComponent {
  name = ''
  wide = false
  width = 1
  save(): void {}
}
