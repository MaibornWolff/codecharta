import { Injectable } from "@angular/core"
import { InspectorIsDeltaStateStore } from "../stores/isDeltaState.store"
import { InspectorSelectedNodeStore } from "../stores/selectedNode.store"

@Injectable({
    providedIn: "root"
})
export class InspectorHeaderService {
    constructor(
        private readonly selectedNodeStore: InspectorSelectedNodeStore,
        private readonly isDeltaStateStore: InspectorIsDeltaStateStore
    ) {}

    selectedNode$() {
        return this.selectedNodeStore.selectedNode$
    }

    isDeltaState$() {
        return this.isDeltaStateStore.isDeltaState$
    }
}
