import { Component, Input, ViewEncapsulation } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable } from "rxjs"

import { CodeMapNode, CcState } from "../../../../codeCharta.model"
import { rootUnarySelector } from "../../../../state/selectors/accumulatedData/rootUnary.selector"
import { searchedNodePathsSelector } from "../../../../state/selectors/searchedNodes/searchedNodePaths.selector"
import { areaMetricSelector } from "../../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"

@Component({
    selector: "cc-map-tree-view-item-name",
    templateUrl: "./mapTreeViewItemName.component.html",
    encapsulation: ViewEncapsulation.None
})
export class MapTreeViewItemNameComponent {
    @Input() node: CodeMapNode
    @Input() isHovered: boolean
    @Input() unaryValue: number
    @Input() unaryPercentage: number

    searchedNodePaths$: Observable<Set<string>>
    rootUnary$: Observable<number>
    areaMetric$: Observable<string>

    constructor(store: Store<CcState>) {
        this.searchedNodePaths$ = store.select(searchedNodePathsSelector)
        this.rootUnary$ = store.select(rootUnarySelector)
        this.areaMetric$ = store.select(areaMetricSelector)
    }
}
