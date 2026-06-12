import { Injectable } from "@angular/core"
import { LegendEdgeMetricStore } from "../stores/edgeMetric.store"

@Injectable({
    providedIn: "root"
})
export class LegendEdgeMetricService {
    constructor(private readonly edgeMetricStore: LegendEdgeMetricStore) {}

    edgeMetric$() {
        return this.edgeMetricStore.edgeMetric$
    }
}
