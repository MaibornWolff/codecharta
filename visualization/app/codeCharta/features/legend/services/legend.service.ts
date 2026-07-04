import { Injectable } from "@angular/core"
import { MetricsLensFacade } from "../../../lenses/metrics/metricsLens.facade"
import { LegendMapStateStore } from "../stores/legendMapState.store"
import { IsDeltaStateStore } from "../../shared/facade"

/**
 * The single seam every legend component injects. The attribute descriptors come from the metrics-lens
 * facade (descriptors$ — legend is an outside consumer, so it reaches the lens only through its public
 * facade); the color-metric value range, the six view/appearance reads and the delta flag come from the
 * feature-local stores — the only legend code allowed to inject @ngrx Store, so the service and
 * components stay ngrx-free.
 */
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
