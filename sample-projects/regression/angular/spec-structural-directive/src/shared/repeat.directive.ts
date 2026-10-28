import { Directive, Input } from '@angular/core'

@Directive({ selector: '[appRepeat][appRepeatOf]', standalone: true })
export class RepeatDirective {
  @Input() appRepeatOf: unknown[] = []
}
