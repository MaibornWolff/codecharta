import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { isColorMetricLinkedToHeightMetricSelector } from "../../../state/store/appSettings/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.selector"
import { toggleIsColorMetricLinkedToHeightMetric } from "../../../state/store/appSettings/isHeightAndColorMetricLinked/isColorMetricLinkedToHeightMetric.actions"

@Injectable({
    providedIn: "root"
})
export class IsHeightAndColorMetricLinkedStore {
    constructor(private readonly store: Store<CcState>) {}

    isHeightAndColorMetricLinked$ = this.store.select(isColorMetricLinkedToHeightMetricSelector)

    toggleIsHeightAndColorMetricLinked() {
        this.store.dispatch(toggleIsColorMetricLinkedToHeightMetric())
    }
}
