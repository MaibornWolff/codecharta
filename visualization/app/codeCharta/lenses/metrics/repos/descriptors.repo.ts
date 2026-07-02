import { Injectable } from "@angular/core"
import { AttributeDescriptors, AttributeTypeValue } from "../../../codeCharta.model"
import { MetricsLensStore } from "../store/metricsLens.store"

/** Metric metadata access for the metrics lens (node-side descriptors + types; the store owns the node projection). */
@Injectable({ providedIn: "root" })
export class DescriptorsRepo {
    constructor(private readonly store: MetricsLensStore) {}

    readonly descriptors$ = this.store.attributeDescriptors$
    readonly attributeTypes$ = this.store.attributeTypes$

    descriptors(): AttributeDescriptors {
        return this.store.getAttributeDescriptors()
    }

    attributeTypes(): Record<string, AttributeTypeValue> {
        return this.store.getAttributeTypes()
    }
}
