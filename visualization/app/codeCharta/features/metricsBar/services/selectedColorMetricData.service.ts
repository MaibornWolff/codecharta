import { Injectable } from "@angular/core"
import { SelectedColorMetricDataStore } from "../stores/selectedColorMetricData.store"

@Injectable({
    providedIn: "root"
})
export class SelectedColorMetricDataService {
    constructor(private readonly selectedColorMetricDataStore: SelectedColorMetricDataStore) {}

    selectedColorMetricData$() {
        return this.selectedColorMetricDataStore.selectedColorMetricData$
    }
}
