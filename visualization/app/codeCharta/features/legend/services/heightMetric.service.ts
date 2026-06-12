import { Injectable } from "@angular/core"
import { LegendHeightMetricStore } from "../stores/heightMetric.store"

@Injectable({
    providedIn: "root"
})
export class LegendHeightMetricService {
    constructor(private readonly heightMetricStore: LegendHeightMetricStore) {}

    heightMetric$() {
        return this.heightMetricStore.heightMetric$
    }
}
