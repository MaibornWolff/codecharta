import { Injectable } from "@angular/core"
import { HoveredNodeStore } from "../stores/hoveredNode.store"

@Injectable({
    providedIn: "root"
})
export class HoveredNodeService {
    constructor(private readonly hoveredNodeStore: HoveredNodeStore) {}

    hoveredNode$() {
        return this.hoveredNodeStore.hoveredNode$
    }
}
