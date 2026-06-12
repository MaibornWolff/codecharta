import { Injectable } from "@angular/core"
import { LegendColorMetricStore } from "../stores/colorMetric.store"

@Injectable({
    providedIn: "root"
})
export class LegendColorMetricService {
    constructor(private readonly colorMetricStore: LegendColorMetricStore) {}

    colorMetric$() {
        return this.colorMetricStore.colorMetric$
    }
}
