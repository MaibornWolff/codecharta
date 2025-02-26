import { Component, Input } from "@angular/core"
import { Store } from "@ngrx/store"
import { Observable } from "rxjs"

import { CcState, CodeMapNode } from "../../../../../codeCharta.model"
import { rootUnarySelector } from "../../../../../state/selectors/accumulatedData/rootUnary.selector"
import { searchedNodePathsSelector } from "../../../../../state/selectors/searchedNodes/searchedNodePaths.selector"
import { areaMetricSelector } from "../../../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"
import { NgPlural, NgPluralCase, AsyncPipe } from "@angular/common"
import { AreaMetricValidPipe } from "../areaMetricValidPipe.pipe"
import { IsNodeLeafPipe } from "../isNodeLeaf.pipe"

@Component({
    selector: "cc-map-tree-view-item-name",
    templateUrl: "./mapTreeViewItemName.component.html",
    styleUrls: ["./mapTreeViewItemName.component.scss"],
    standalone: true,
    imports: [NgPlural, NgPluralCase, AsyncPipe, AreaMetricValidPipe, IsNodeLeafPipe]
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
