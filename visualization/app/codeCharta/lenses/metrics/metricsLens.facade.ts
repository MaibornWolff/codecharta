import { Injectable } from "@angular/core"
import { DescriptorsRepo } from "./repos/descriptors.repo"

@Injectable({ providedIn: "root" })
export class MetricsLensFacade {
    constructor(private readonly descriptorsRepo: DescriptorsRepo) {}

    readonly descriptors$ = this.descriptorsRepo.descriptors$
    readonly attributeTypes$ = this.descriptorsRepo.attributeTypes$

    descriptors() {
        return this.descriptorsRepo.descriptors()
    }

    attributeTypes() {
        return this.descriptorsRepo.attributeTypes()
    }
}

export { nodeAttributeDescriptorsSelector as attributeDescriptorsSelector, nodeAttributeTypesSelector } from "./store/attributes.selectors"
