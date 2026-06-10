import { Injectable } from "@angular/core"
import { ColorMetricStore } from "../stores/colorMetric.store"

@Injectable({
    providedIn: "root"
})
export class ColorMetricService {
    constructor(private readonly colorMetricStore: ColorMetricStore) {}

    colorMetric$() {
        return this.colorMetricStore.colorMetric$
    }

    setColorMetric(value: string) {
        this.colorMetricStore.setColorMetric(value)
    }
}
