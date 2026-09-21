import { Injectable } from "@angular/core"
import { Action, Store } from "@ngrx/store"
import { CcState, RuleEffect } from "../../../model/codeCharta.model"
import { hoveredNodeSelector, selectedNodeSelector } from "../../../renderer/renderModel/renderModel.facade"
import { sortedFlattenedNodesSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { dispatchRuleChange } from "../../../util/dispatchAfterPaint"
import { hoveredNodeMetricDistributionSelector } from "../selectors/hoveredNodeMetricDistribution.selector"

@Injectable({
    providedIn: "root"
})
export class ExtensionRulesStore {
    constructor(private readonly store: Store<CcState>) {}

    readonly hoveredNodeMetricDistribution$ = this.store.select(hoveredNodeMetricDistributionSelector)
    readonly hoveredNode$ = this.store.select(hoveredNodeSelector)
    readonly selectedNode$ = this.store.select(selectedNodeSelector)
    readonly flattenedItems$ = this.store.select(sortedFlattenedNodesSelector)

    dispatchRuleChange(effect: RuleEffect, action: Action | Action[]) {
        dispatchRuleChange(this.store, effect, action)
    }
}
