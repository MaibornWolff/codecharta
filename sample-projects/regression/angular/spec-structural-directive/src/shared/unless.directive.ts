import { Directive, Input } from '@angular/core'

@Directive({ selector: '[appUnless]', standalone: true })
export class UnlessDirective {
  @Input() appUnless = false
}
