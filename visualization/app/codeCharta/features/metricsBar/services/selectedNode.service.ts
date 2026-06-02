import { Injectable } from "@angular/core"
import { SelectedNodeStore } from "../stores/selectedNode.store"

@Injectable({
    providedIn: "root"
})
export class SelectedNodeService {
    constructor(private readonly selectedNodeStore: SelectedNodeStore) {}

    selectedNode$() {
        return this.selectedNodeStore.selectedNode$
    }
}
