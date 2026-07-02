import { Injectable } from "@angular/core"
import { AttributesRepo } from "./repos/attributes.repo"
import { DescriptorsRepo } from "./repos/descriptors.repo"

/**
 * Public surface of the metrics lens — the ONLY thing outsiders import (the `store/` + `repos/` stay
 * private, enforced by `lens-external-access-only-via-public-surface`). It serves all three Slice-1
 * consumer shapes:
 *   (a) this injectable `MetricsLensFacade` for service/component consumers;
 *   (b) the re-exported public ngrx selectors below for `createSelector` graphs that can't inject.
 */
@Injectable({ providedIn: "root" })
export class MetricsLensFacade {
    constructor(
        private readonly attributesRepo: AttributesRepo,
        private readonly descriptorsRepo: DescriptorsRepo
    ) {}

    readonly nodeMetricData$ = this.attributesRepo.nodeMetricData$
    readonly availableMetrics$ = this.attributesRepo.availableMetrics$
    readonly selectedColorMetricData$ = this.attributesRepo.colorMetricRange$
    readonly descriptors$ = this.descriptorsRepo.descriptors$
    readonly attributeTypes$ = this.descriptorsRepo.attributeTypes$

    availableMetrics() {
        return this.attributesRepo.availableMetrics()
    }

    getNodeMetricData() {
        return this.attributesRepo.getNodeMetricData()
    }

    rangeOf(metric: string) {
        return this.attributesRepo.rangeOf(metric)
    }

    rangeOf$(metric: string) {
        return this.attributesRepo.rangeOf$(metric)
    }

    descriptors() {
        return this.descriptorsRepo.descriptors()
    }

    attributeTypes() {
        return this.descriptorsRepo.attributeTypes()
    }
}

// (b) Public ngrx selector surface for the createSelector graphs that consume the lens.
// `nodeMetricDataSelector`/`metricRangeSelector` were lifted OUT of the lens in Slice 7 (they read
// blacklist + colorMetric view state); consumers import them from
// `state/selectors/nodeMetricData/nodeMetricData.selector` directly. The lens surface stays read-only
// over cc.json-derived attribute descriptors.
export { nodeAttributeDescriptorsSelector as attributeDescriptorsSelector } from "./store/attributes.selectors"
