import { Component } from '@angular/core'
import { ListItemDirective } from '../shared/list-item.directive'
import { RepeatDirective } from '../shared/repeat.directive'
import { TrackByDirective } from '../shared/track-by.directive'
import { UnlessDirective } from '../shared/unless.directive'

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  standalone: true,
  imports: [ListItemDirective, RepeatDirective, TrackByDirective, UnlessDirective]
})
export class ListComponent {
  items: string[] = []
  byName(index: number, item: string): string {
    return item
  }
}
