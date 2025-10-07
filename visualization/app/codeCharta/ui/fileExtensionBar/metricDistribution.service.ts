import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../codeCharta.model"
import { hoveredNodeMetricDistributionSelector } from "./selectors/hoveredNodeMetricDistribution.selector"

@Injectable({ providedIn: "root" })
export class MetricDistributionService {
    constructor(private readonly store: Store<CcState>) {}

    readonly hoveredNodeMetricDistribution$ = this.store.select(hoveredNodeMetricDistributionSelector)
}
