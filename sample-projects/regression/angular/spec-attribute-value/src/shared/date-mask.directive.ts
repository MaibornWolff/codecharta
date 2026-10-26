import { Directive } from '@angular/core'

@Directive({ selector: 'input[appMask=date]', standalone: true })
export class DateMaskDirective {}
