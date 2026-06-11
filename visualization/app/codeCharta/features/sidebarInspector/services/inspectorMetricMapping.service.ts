import { Injectable } from "@angular/core"
import { InspectorMappingBlocksStore } from "../stores/inspectorMappingBlocks.store"

@Injectable({
    providedIn: "root"
})
export class InspectorMetricMappingService {
    constructor(private readonly mappingBlocksStore: InspectorMappingBlocksStore) {}

    mappingBlocks$() {
        return this.mappingBlocksStore.mappingBlocks$
    }
}
