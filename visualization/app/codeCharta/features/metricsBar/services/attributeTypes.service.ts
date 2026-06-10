import { Injectable } from "@angular/core"
import { AttributeTypes, PrimaryMetrics } from "../../../codeCharta.model"
import { AttributeTypesStore } from "../stores/attributeTypes.store"

@Injectable({
    providedIn: "root"
})
export class AttributeTypesService {
    constructor(private readonly attributeTypesStore: AttributeTypesStore) {}

    attributeTypes$() {
        return this.attributeTypesStore.attributeTypes$
    }

    attributeTypeLabel$(attributeType: keyof AttributeTypes, metricFor: keyof PrimaryMetrics) {
        return this.attributeTypesStore.attributeTypeLabel$(attributeType, metricFor)
    }
}
