import { Injectable } from "@angular/core"
import { DistributionMetricStore } from "../stores/distributionMetric.store"

@Injectable({ providedIn: "root" })
export class DistributionMetricService {
    constructor(private readonly distributionMetricStore: DistributionMetricStore) {}

    readonly areaMetric$ = this.distributionMetricStore.areaMetric$
}
