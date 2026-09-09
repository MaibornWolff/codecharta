import { Injectable, inject } from "@angular/core"
import { createSelector, Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { blacklistSelector, metricRulesSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { clearRulesOfType } from "../../../stores/sharedView/sharedView.write.facade"

const ruleCountSelector = createSelector(
    blacklistSelector,
    metricRulesSelector,
    (blacklist, metricRules) => blacklist.length + metricRules.length
)

/**
 * Clears both rule lists and nothing else — the way back from a map that has been filtered down to
 * nothing, without discarding the loaded files, the metrics and the camera the way a map reset does.
 */
@Injectable({ providedIn: "root" })
export class FiltersResetStore {
    private readonly store = inject<Store<CcState>>(Store)

    readonly ruleCount$ = this.store.select(ruleCountSelector)

    resetFilters() {
        this.store.dispatch(clearRulesOfType({ blacklistType: "flatten" }))
        this.store.dispatch(clearRulesOfType({ blacklistType: "exclude" }))
    }
}
