import { Directive } from '@angular/core'

@Directive({ selector: 'input[appFocus], textarea[appFocus]', standalone: true })
export class FocusDirective {}
