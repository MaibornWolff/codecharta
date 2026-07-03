import { Injectable } from "@angular/core"
import { AttributesRepo } from "../../../repos/attributes.repo"
import { DescriptorsRepo } from "../../../repos/descriptors.repo"
import { LegendMapStateStore } from "../stores/legendMapState.store"
import { LegendIsDeltaStateStore } from "../stores/isDeltaState.store"

/**
 * The single seam every legend component injects. While legend still lives inside the metrics lens the
 * metric data comes from the lens repos (internal access); the six view/appearance reads and the delta
 * flag come from the feature-local stores — the only legend code allowed to inject @ngrx Store, so the
 * service and components stay ngrx-free. Slice 11 swaps the repos for the lens facade once legend
 * re-homes to features/legend/ (a lens's internals may not import its own facade).
 */
@Injectable({ providedIn: "root" })
export class LegendService {
    constructor(
        private readonly attributesRepo: AttributesRepo,
        private readonly descriptorsRepo: DescriptorsRepo,
        private readonly legendMapStateStore: LegendMapStateStore,
        private readonly legendIsDeltaStateStore: LegendIsDeltaStateStore
    ) {}

    selectedColorMetricData$() {
        return this.attributesRepo.colorMetricRange$
    }

    attributeDescriptors$() {
        return this.descriptorsRepo.descriptors$
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
