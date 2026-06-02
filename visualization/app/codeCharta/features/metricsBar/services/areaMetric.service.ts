import { Injectable } from "@angular/core"
import { AreaMetricStore } from "../stores/areaMetric.store"

@Injectable({
    providedIn: "root"
})
export class AreaMetricService {
    constructor(private readonly areaMetricStore: AreaMetricStore) {}

    areaMetric$() {
        return this.areaMetricStore.areaMetric$
    }

    setAreaMetric(value: string) {
        this.areaMetricStore.setAreaMetric(value)
    }
}
