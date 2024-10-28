import { Component } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable } from "rxjs"

import { CcState, CodeMapNode } from "../../../../codeCharta.model"
import { mapTreeViewNodeSelector } from "./mapTreeViewNodeSelector/mapTreeViewNode.selector"
import { MapTreeViewLevelComponent } from "./mapTreeViewLevel/mapTreeViewLevel.component"
import { AsyncPipe } from "@angular/common"

@Component({
    selector: "cc-map-tree-view",
    templateUrl: "./mapTreeView.component.html",
    standalone: true,
    imports: [MapTreeViewLevelComponent, AsyncPipe]
})
export class MapTreeViewComponent {
    mapTreeViewNode$: Observable<CodeMapNode>

    constructor(store: Store<CcState>) {
        this.mapTreeViewNode$ = store.select(mapTreeViewNodeSelector)
    }
}
