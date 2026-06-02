import { Injectable } from "@angular/core"
import { AttributeDescriptorsStore } from "../stores/attributeDescriptors.store"

@Injectable({
    providedIn: "root"
})
export class AttributeDescriptorsService {
    constructor(private readonly attributeDescriptorsStore: AttributeDescriptorsStore) {}

    attributeDescriptors$() {
        return this.attributeDescriptorsStore.attributeDescriptors$
    }
}
