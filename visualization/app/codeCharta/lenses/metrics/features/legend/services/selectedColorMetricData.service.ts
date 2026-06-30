import { Injectable } from "@angular/core"
import { LegendSelectedColorMetricDataStore } from "../stores/selectedColorMetricData.store"

@Injectable({
    providedIn: "root"
})
export class LegendSelectedColorMetricDataService {
    constructor(private readonly selectedColorMetricDataStore: LegendSelectedColorMetricDataStore) {}

    selectedColorMetricData$() {
        return this.selectedColorMetricDataStore.selectedColorMetricData$
    }
}
