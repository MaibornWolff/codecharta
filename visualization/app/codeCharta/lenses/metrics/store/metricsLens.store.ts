import { Injectable } from "@angular/core"
import { State, Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { nodeAttributeDescriptorsSelector, nodeAttributeTypesSelector } from "./attributes.selectors"

/**
 * State-holder for the metrics lens. Projects the node-side attribute descriptors/types for the visible
 * selection, reusing the existing descriptor/type selectors so test wiring that overrides them keeps
 * propagating. Exposes both reactive (`$`) and sync snapshot forms; the repos read from here.
 *
 * The view-aware node-metric data + color-metric range are NOT projected here: they read blacklist +
 * colorMetric view state, so they live in `state/selectors/nodeMetricData` and consumers read those
 * selectors through their own feature stores (Slice 12c inversion — the lens stops re-exposing them, so
 * lens code no longer imports state/).
 */
@Injectable({ providedIn: "root" })
export class MetricsLensStore {
    constructor(
        private readonly store: Store<CcState>,
        private readonly state: State<CcState>
    ) {}

    readonly attributeDescriptors$ = this.store.select(nodeAttributeDescriptorsSelector)
    readonly attributeTypes$ = this.store.select(nodeAttributeTypesSelector)

    getAttributeDescriptors() {
        return nodeAttributeDescriptorsSelector(this.state.getValue())
    }

    getAttributeTypes() {
        return nodeAttributeTypesSelector(this.state.getValue())
    }
}
