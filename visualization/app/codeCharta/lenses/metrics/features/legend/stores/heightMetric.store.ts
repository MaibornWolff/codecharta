import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../../../codeCharta.model"
import { heightMetricSelector } from "../../../../../state/store/dynamicSettings/heightMetric/heightMetric.selector"

@Injectable({
    providedIn: "root"
})
export class LegendHeightMetricStore {
    constructor(private readonly store: Store<CcState>) {}

    heightMetric$ = this.store.select(heightMetricSelector)
}
