import { Directive } from '@angular/core'

@Directive({ selector: '[appTip]:not(a)', standalone: true })
export class TipDirective {}
