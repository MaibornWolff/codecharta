import { Injectable } from "@angular/core"
import { MetricDistributionStore } from "../stores/metricDistribution.store"

@Injectable({ providedIn: "root" })
export class MetricDistributionService {
    constructor(private readonly metricDistributionStore: MetricDistributionStore) {}

    readonly hoveredNodeMetricDistribution$ = this.metricDistributionStore.hoveredNodeMetricDistribution$
}
