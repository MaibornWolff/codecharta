import { Injectable } from "@angular/core"
import { AmountOfBuildingsWithSelectedEdgeMetricStore } from "../stores/amountOfBuildingsWithSelectedEdgeMetric.store"

@Injectable({
    providedIn: "root"
})
export class AmountOfBuildingsWithSelectedEdgeMetricService {
    constructor(private readonly amountOfBuildingsWithSelectedEdgeMetricStore: AmountOfBuildingsWithSelectedEdgeMetricStore) {}

    amountOfBuildingsWithSelectedEdgeMetric$() {
        return this.amountOfBuildingsWithSelectedEdgeMetricStore.amountOfBuildingsWithSelectedEdgeMetric$
    }
}
