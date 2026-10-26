import { Component } from '@angular/core'
import { FocusDirective } from '../shared/focus.directive'
import { TipDirective } from '../shared/tip.directive'

@Component({ selector: 'app-note', templateUrl: './note.component.html', standalone: true, imports: [TipDirective, FocusDirective] })
export class NoteComponent {}
