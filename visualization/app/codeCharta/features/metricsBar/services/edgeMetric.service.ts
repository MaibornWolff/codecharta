import { Injectable } from "@angular/core"
import { EdgeMetricStore } from "../stores/edgeMetric.store"

@Injectable({
    providedIn: "root"
})
export class EdgeMetricService {
    constructor(private readonly edgeMetricStore: EdgeMetricStore) {}

    edgeMetric$() {
        return this.edgeMetricStore.edgeMetric$
    }

    setEdgeMetric(value: string) {
        this.edgeMetricStore.setEdgeMetric(value)
    }
}
