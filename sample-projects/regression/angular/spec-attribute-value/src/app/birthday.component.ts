import { Component } from '@angular/core'
import { DateMaskDirective } from '../shared/date-mask.directive'
import { PhoneMaskDirective } from '../shared/phone-mask.directive'

@Component({ selector: 'app-birthday', templateUrl: './birthday.component.html', standalone: true, imports: [DateMaskDirective, PhoneMaskDirective] })
export class BirthdayComponent {}
