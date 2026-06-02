import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { metricDataSelector } from "../../../state/selectors/accumulatedData/metricData/metricData.selector"

@Injectable({
    providedIn: "root"
})
export class MetricDataStore {
    constructor(private readonly store: Store<CcState>) {}

    metricData$ = this.store.select(metricDataSelector)
}
