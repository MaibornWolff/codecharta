import { Injectable } from "@angular/core"
import { DescriptorsRepo } from "./repos/descriptors.repo"

/**
 * Public surface of the metrics lens — the ONLY thing outsiders import (the `store/` + `repos/` stay
 * private, enforced by `lens-external-access-only-via-public-surface`). It serves all three Slice-1
 * consumer shapes:
 *   (a) this injectable `MetricsLensFacade` for service/component consumers;
 *   (b) the re-exported public ngrx selectors below for `createSelector` graphs that can't inject.
 *
 * The lens exposes only its cc.json-derived attribute descriptors + types. The view-aware node-metric
 * data / color-metric range are NOT here: they read view state, so consumers read
 * `nodeMetricDataSelector`/`metricRangeSelector` from `renderModel/nodeMetricData` through their own
 * feature stores (Slice 12c inversion).
 */
@Injectable({ providedIn: "root" })
export class MetricsLensFacade {
    constructor(private readonly descriptorsRepo: DescriptorsRepo) {}

    readonly descriptors$ = this.descriptorsRepo.descriptors$
    readonly attributeTypes$ = this.descriptorsRepo.attributeTypes$

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
// `renderModel/nodeMetricData/nodeMetricData.selector` directly. The lens surface stays read-only
// over cc.json-derived attribute descriptors + types.
export { nodeAttributeDescriptorsSelector as attributeDescriptorsSelector } from "./store/attributes.selectors"

// Node attribute-type map — the metrics lens owns the NODE side of the cc.json `attributeTypes`; the
// EDGE side re-homed to the dependency lens in Slice 14 (`dependencyLens.facade`'s
// `edgeAttributeTypesSelector`). The composing layer (`accumulatedData` + the metricsBar attribute-type
// label pipeline) reads both and recombines them into the full `{ nodes, edges }` map their signatures
// need — neither lens exposes the full map anymore, so the edge side is only reachable via the
// dependency lens.
export { nodeAttributeTypesSelector } from "./store/attributes.selectors"
