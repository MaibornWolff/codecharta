import { Injectable } from "@angular/core"
import { LegendAttributeDescriptorsStore } from "../stores/attributeDescriptors.store"

@Injectable({
    providedIn: "root"
})
export class LegendAttributeDescriptorsService {
    constructor(private readonly attributeDescriptorsStore: LegendAttributeDescriptorsStore) {}

    attributeDescriptors$() {
        return this.attributeDescriptorsStore.attributeDescriptors$
    }
}
