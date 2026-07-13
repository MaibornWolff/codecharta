import { Injectable } from "@angular/core"
import { MetricsLensFacade } from "../../../lenses/metrics/metricsLens.facade"
import { IsDeltaStateStore } from "../../shared/facade"
import { LegendMapStateStore } from "../stores/legendMapState.store"

@Injectable({ providedIn: "root" })
export class LegendService {
    constructor(
        private readonly metricsLensFacade: MetricsLensFacade,
        private readonly legendMapStateStore: LegendMapStateStore,
        private readonly legendIsDeltaStateStore: IsDeltaStateStore
    ) {}

    selectedColorMetricData$() {
        return this.legendMapStateStore.selectedColorMetricData$
    }

    attributeDescriptors$() {
        return this.metricsLensFacade.descriptors$
    }

    areaMetric$() {
        return this.legendMapStateStore.areaMetric$
    }

    heightMetric$() {
        return this.legendMapStateStore.heightMetric$
    }

    colorMetric$() {
        return this.legendMapStateStore.colorMetric$
    }

    edgeMetric$() {
        return this.legendMapStateStore.edgeMetric$
    }

    colorRange$() {
        return this.legendMapStateStore.colorRange$
    }

    mapColors$() {
        return this.legendMapStateStore.mapColors$
    }

    isDeltaState$() {
        return this.legendIsDeltaStateStore.isDeltaState$
    }
}
