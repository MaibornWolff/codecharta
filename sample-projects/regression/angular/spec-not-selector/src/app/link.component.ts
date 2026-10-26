import { Component } from '@angular/core'
import { LinkTipDirective } from '../shared/link-tip.directive'
import { TipDirective } from '../shared/tip.directive'

@Component({ selector: 'app-link', templateUrl: './link.component.html', standalone: true, imports: [TipDirective, LinkTipDirective] })
export class LinkComponent {}
