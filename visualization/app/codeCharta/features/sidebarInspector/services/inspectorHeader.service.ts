import { Injectable } from "@angular/core"
import { IsDeltaStateStore } from "../../shared/facade"
import { InspectorSelectedNodeStore } from "../stores/selectedNode.store"

@Injectable({
    providedIn: "root"
})
export class InspectorHeaderService {
    constructor(
        private readonly selectedNodeStore: InspectorSelectedNodeStore,
        private readonly isDeltaStateStore: IsDeltaStateStore
    ) {}

    selectedNode$() {
        return this.selectedNodeStore.selectedNode$
    }

    isDeltaState$() {
        return this.isDeltaStateStore.isDeltaState$
    }
}
