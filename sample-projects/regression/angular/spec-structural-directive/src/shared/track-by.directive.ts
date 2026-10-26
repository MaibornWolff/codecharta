import { Directive, Input } from '@angular/core'

@Directive({ selector: '[appRepeatTrackBy]', standalone: true })
export class TrackByDirective {
  @Input() appRepeatTrackBy: unknown
}
