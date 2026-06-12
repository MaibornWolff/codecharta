import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { selectedColorMetricDataSelector } from "../../../state/selectors/accumulatedData/metricData/selectedColorMetricData.selector"

@Injectable({
    providedIn: "root"
})
export class LegendSelectedColorMetricDataStore {
    constructor(private readonly store: Store<CcState>) {}

    selectedColorMetricData$ = this.store.select(selectedColorMetricDataSelector)
}
