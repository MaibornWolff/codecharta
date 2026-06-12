import { Injectable } from "@angular/core"
import { LegendAreaMetricStore } from "../stores/areaMetric.store"

@Injectable({
    providedIn: "root"
})
export class LegendAreaMetricService {
    constructor(private readonly areaMetricStore: LegendAreaMetricStore) {}

    areaMetric$() {
        return this.areaMetricStore.areaMetric$
    }
}
