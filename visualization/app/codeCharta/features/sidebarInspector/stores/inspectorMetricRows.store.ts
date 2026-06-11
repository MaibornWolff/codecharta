import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { inspectorMetricRowsSelector } from "../selectors/inspectorMetricRows.selector"

@Injectable({
    providedIn: "root"
})
export class InspectorMetricRowsStore {
    constructor(private readonly store: Store<CcState>) {}

    metricRows$ = this.store.select(inspectorMetricRowsSelector)
}
