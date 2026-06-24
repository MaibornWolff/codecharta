import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { hoveredNodeMetricDistributionSelector } from "../selectors/hoveredNodeMetricDistribution.selector"
import { metricDistributionSelector } from "../selectors/metricDistribution.selector"

@Injectable({
    providedIn: "root"
})
export class MetricDistributionStore {
    constructor(private readonly store: Store<CcState>) {}

    readonly hoveredNodeMetricDistribution$ = this.store.select(hoveredNodeMetricDistributionSelector)
    readonly metricDistribution$ = this.store.select(metricDistributionSelector)
}
