import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { MetricsLensSourceReadWindow } from "../../../stores/metricsLensSource/metricsLensSource.read.facade"
import { nodeAttributeDescriptorsSelector, nodeAttributeTypesSelector } from "./attributes.selectors"

@Injectable({ providedIn: "root" })
export class MetricsLensStore {
    constructor(
        private readonly store: Store<CcState>,
        private readonly metricsLensSourceReadWindow: MetricsLensSourceReadWindow
    ) {}

    readonly attributeDescriptors$ = this.store.select(nodeAttributeDescriptorsSelector)
    readonly attributeTypes$ = this.store.select(nodeAttributeTypesSelector)

    getAttributeDescriptors() {
        return this.metricsLensSourceReadWindow.getAttributeDescriptors()
    }

    getAttributeTypes() {
        return this.metricsLensSourceReadWindow.getNodeAttributeTypes()
    }
}
