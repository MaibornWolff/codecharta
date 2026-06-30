import { Injectable } from "@angular/core"
import { map } from "rxjs"
import { AttributeDescriptors, AttributeTypeValue } from "../../../codeCharta.model"
import { MetricsLensStore } from "../store/metricsLens.store"

/** Metric metadata access for the metrics lens (node-side descriptors + types; `AttributeTypes.nodes` defaults to `{}`). */
@Injectable({ providedIn: "root" })
export class DescriptorsRepo {
    constructor(private readonly store: MetricsLensStore) {}

    readonly descriptors$ = this.store.attributeDescriptors$
    readonly attributeTypes$ = this.store.attributeTypes$.pipe(map(attributeTypes => attributeTypes.nodes ?? {}))

    descriptors(): AttributeDescriptors {
        return this.store.getAttributeDescriptors()
    }

    attributeTypes(): Record<string, AttributeTypeValue> {
        return this.store.getAttributeTypes().nodes ?? {}
    }
}
