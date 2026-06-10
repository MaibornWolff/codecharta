import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { AttributeTypes, CcState, PrimaryMetrics } from "../../../codeCharta.model"
import { attributeTypesSelector } from "../../../state/store/fileSettings/attributeTypes/attributeTypes.selector"
import { createAttributeTypeSelector } from "../selectors/createAttributeTypeSelector.selector"

@Injectable({
    providedIn: "root"
})
export class AttributeTypesStore {
    constructor(private readonly store: Store<CcState>) {}

    attributeTypes$ = this.store.select(attributeTypesSelector)

    attributeTypeLabel$(attributeType: keyof AttributeTypes, metricFor: keyof PrimaryMetrics) {
        return this.store.select(createAttributeTypeSelector(attributeType, metricFor))
    }
}
