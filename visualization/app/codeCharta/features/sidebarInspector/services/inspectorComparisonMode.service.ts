import { Injectable, signal } from "@angular/core"

export type MetricComparisonMode = "map" | "range"

@Injectable({ providedIn: "root" })
export class InspectorComparisonModeService {
    readonly comparisonMode = signal<MetricComparisonMode>("map")

    setComparisonMode(mode: MetricComparisonMode) {
        this.comparisonMode.set(mode)
    }
}
