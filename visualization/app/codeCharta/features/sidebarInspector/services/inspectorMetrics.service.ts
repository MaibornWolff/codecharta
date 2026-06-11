import { Injectable } from "@angular/core"
import { InspectorMapColorsStore } from "../stores/mapColors.store"
import { InspectorMetricRowsStore } from "../stores/inspectorMetricRows.store"

@Injectable({
    providedIn: "root"
})
export class InspectorMetricsService {
    constructor(
        private readonly metricRowsStore: InspectorMetricRowsStore,
        private readonly mapColorsStore: InspectorMapColorsStore
    ) {}

    metricRows$() {
        return this.metricRowsStore.metricRows$
    }

    mapColors$() {
        return this.mapColorsStore.mapColors$
    }
}
