import { Injectable } from "@angular/core"
import { AttributeTypesStore } from "../stores/attributeTypes.store"

@Injectable({
    providedIn: "root"
})
export class AttributeTypesService {
    constructor(private readonly attributeTypesStore: AttributeTypesStore) {}

    attributeTypes$() {
        return this.attributeTypesStore.attributeTypes$
    }
}
