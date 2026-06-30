import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../../../codeCharta.model"
import { edgeMetricSelector } from "../../../../../state/store/dynamicSettings/edgeMetric/edgeMetric.selector"

@Injectable({
    providedIn: "root"
})
export class LegendEdgeMetricStore {
    constructor(private readonly store: Store<CcState>) {}

    edgeMetric$ = this.store.select(edgeMetricSelector)
}
