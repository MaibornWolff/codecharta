import { Injectable } from "@angular/core"
import { State, Store } from "@ngrx/store"
import { CcState } from "../../../codeCharta.model"
import { attributeDescriptorsSelector } from "../../../state/store/fileSettings/attributeDescriptors/attributeDescriptors.selector"
import { attributeTypesSelector } from "../../../state/store/fileSettings/attributeTypes/attributeTypes.selector"
import { metricRangeSelector, nodeMetricDataSelector } from "./metricsLens.selectors"

/**
 * State-holder for the metrics lens. Projects node-metric data (and the color-metric range) plus the
 * node-side attribute descriptors/types for the visible selection, reusing the existing descriptor/type
 * selectors so test wiring that overrides them keeps propagating. Exposes both reactive (`$`) and sync
 * snapshot forms; the repos read from here.
 */
@Injectable({ providedIn: "root" })
export class MetricsLensStore {
    constructor(
        private readonly store: Store<CcState>,
        private readonly state: State<CcState>
    ) {}

    readonly nodeMetricData$ = this.store.select(nodeMetricDataSelector)
    readonly colorMetricRange$ = this.store.select(metricRangeSelector)
    readonly attributeDescriptors$ = this.store.select(attributeDescriptorsSelector)
    readonly attributeTypes$ = this.store.select(attributeTypesSelector)

    getNodeMetricData() {
        return nodeMetricDataSelector(this.state.getValue())
    }

    getColorMetricRange() {
        return metricRangeSelector(this.state.getValue())
    }

    getAttributeDescriptors() {
        return attributeDescriptorsSelector(this.state.getValue())
    }

    getAttributeTypes() {
        return attributeTypesSelector(this.state.getValue())
    }
}
