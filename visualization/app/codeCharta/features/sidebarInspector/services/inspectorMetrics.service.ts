import { Injectable } from "@angular/core"
import { MapStateReadWindow } from "../../../mapState/mapState.read.facade"
import { InspectorMetricRowsStore } from "../stores/inspectorMetricRows.store"

@Injectable({
    providedIn: "root"
})
export class InspectorMetricsService {
    constructor(
        private readonly metricRowsStore: InspectorMetricRowsStore,
        private readonly mapStateReadWindow: MapStateReadWindow
    ) {}

    metricRows$() {
        return this.metricRowsStore.metricRows$
    }

    mapColors$() {
        return this.mapStateReadWindow.mapColors$
    }
}
