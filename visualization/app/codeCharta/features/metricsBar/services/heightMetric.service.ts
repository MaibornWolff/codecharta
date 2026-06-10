import { Injectable } from "@angular/core"
import { HeightMetricStore } from "../stores/heightMetric.store"

@Injectable({
    providedIn: "root"
})
export class HeightMetricService {
    constructor(private readonly heightMetricStore: HeightMetricStore) {}

    heightMetric$() {
        return this.heightMetricStore.heightMetric$
    }

    setHeightMetric(value: string) {
        this.heightMetricStore.setHeightMetric(value)
    }
}
