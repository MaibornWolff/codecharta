import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { isColorMetricLinkedToHeightMetricSelector } from "../../../stores/preferences/preferences.read.facade"
import { toggleIsColorMetricLinkedToHeightMetric } from "../../../stores/preferences/preferences.write.facade"

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
