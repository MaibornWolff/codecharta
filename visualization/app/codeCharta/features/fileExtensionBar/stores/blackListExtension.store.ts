import { Injectable } from "@angular/core"
import { Action, Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { createBlacklistItemSelector } from "../../../state/store/fileSettings/blacklist/blacklistByType.selector"
import { hoveredNodeMetricDistributionSelector } from "../selectors/hoveredNodeMetricDistribution.selector"
import { hoveredNodeSelector } from "../../../state/selectors/hoveredNode.selector"
import { selectedNodeSelector } from "../../../state/selectors/selectedNode.selector"
import { dispatchAfterPaint } from "../../../util/dispatchAfterPaint"

@Injectable({
    providedIn: "root"
})
export class BlackListExtensionStore {
    constructor(private readonly store: Store<CcState>) {}

    readonly hoveredNodeMetricDistribution$ = this.store.select(hoveredNodeMetricDistributionSelector)
    readonly hoveredNode$ = this.store.select(hoveredNodeSelector)
    readonly selectedNode$ = this.store.select(selectedNodeSelector)
    readonly flattenedItems$ = this.store.select(createBlacklistItemSelector("flatten"))

    dispatchAfterPaint(action: Action | Action[]) {
        dispatchAfterPaint(this.store, action)
    }
}
