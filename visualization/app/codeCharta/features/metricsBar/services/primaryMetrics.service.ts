import { Injectable } from "@angular/core"
import { PrimaryMetricsStore } from "../stores/primaryMetrics.store"

@Injectable({
    providedIn: "root"
})
export class PrimaryMetricsService {
    constructor(private readonly primaryMetricsStore: PrimaryMetricsStore) {}

    primaryMetricNames$() {
        return this.primaryMetricsStore.primaryMetricNames$
    }
}
