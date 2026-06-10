import { Injectable } from "@angular/core"
import { MetricDataStore } from "../stores/metricData.store"

@Injectable({
    providedIn: "root"
})
export class MetricDataService {
    constructor(private readonly metricDataStore: MetricDataStore) {}

    metricData$() {
        return this.metricDataStore.metricData$
    }
}
