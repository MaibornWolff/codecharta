import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { setHoveredNodeId } from "./hoveredNodeId/hoveredNodeId.actions"
import { setSelectedNodePath } from "./selectedNodePath/selectedNodePath.actions"

@Injectable({ providedIn: "root" })
export class NodeInteraction {
    constructor(private readonly store: Store<CcState>) {}

    selectNode(path: string): void {
        this.store.dispatch(setSelectedNodePath({ value: path }))
    }

    clearSelection(): void {
        this.store.dispatch(setSelectedNodePath({ value: null }))
    }

    hoverNode(path: string): void {
        this.store.dispatch(setHoveredNodeId({ value: path }))
    }

    clearHover(): void {
        this.store.dispatch(setHoveredNodeId({ value: null }))
    }
}
