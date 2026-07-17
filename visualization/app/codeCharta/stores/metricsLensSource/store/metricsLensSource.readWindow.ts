import { Injectable } from "@angular/core"
import { State, Store } from "@ngrx/store"
import { AttributeDescriptors, AttributeTypeMap, CcState, MetricsLensSource } from "../../../model/codeCharta.model"
import { attributeDescriptorsSelector } from "./attributeDescriptors/attributeDescriptors.selector"
import { nodeAttributeTypesSelector } from "./attributeTypes/attributeTypes.selector"

@Injectable({
    providedIn: "root"
})
export class MetricsLensSourceReadWindow {
    constructor(
        private readonly store: Store<CcState>,
        private readonly state: State<CcState>
    ) {}

    readonly attributeDescriptors$ = this.store.select(attributeDescriptorsSelector)
    readonly nodeAttributeTypes$ = this.store.select(nodeAttributeTypesSelector)

    getMetricsLensSource(): MetricsLensSource {
        return this.state.getValue().metricsLensSource
    }

    getAttributeDescriptors(): AttributeDescriptors {
        return this.state.getValue().metricsLensSource.attributeDescriptors
    }

    getNodeAttributeTypes(): AttributeTypeMap {
        return this.state.getValue().metricsLensSource.attributeTypes
    }
}
