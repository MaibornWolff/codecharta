import { Injectable } from "@angular/core"
import { State, Store } from "@ngrx/store"
import { CcState, ExcludedNode, FlattenedNode, SharedView } from "../../../model/codeCharta.model"
import { excludedNodesSelector } from "./excludedNodes/excludedNodes.selector"
import { excludeMatcherSelector } from "./excludedNodes/excludeMatcher.selector"
import { flattenedNodesSelector } from "./flattenedNodes/flattenedNodes.selector"
import { currentFocusedNodePathSelector } from "./focusedNodePath/currentFocused.selector"
import { focusedNodePathSelector } from "./focusedNodePath/focusedNodePath.selector"
import { hoveredNodeIdSelector } from "./hoveredNodeId/hoveredNodeId.selector"
import { markedPackagesSelector } from "./markedPackages/markedPackages.selector"
import { rightClickedNodeDataSelector } from "./rightClickedNodeData/rightClickedNodeData.selector"
import { searchPatternSelector } from "./searchPattern/searchPattern.selector"
import { selectedNodePathSelector } from "./selectedNodePath/selectedNodePath.selector"

@Injectable({
    providedIn: "root"
})
export class SharedViewReadWindow {
    constructor(
        private readonly store: Store<CcState>,
        private readonly state: State<CcState>
    ) {}

    readonly excludedNodes$ = this.store.select(excludedNodesSelector)
    readonly flattenedNodes$ = this.store.select(flattenedNodesSelector)
    readonly excludeMatcher$ = this.store.select(excludeMatcherSelector)
    readonly focusedNodePath$ = this.store.select(focusedNodePathSelector)
    readonly currentFocusedNodePath$ = this.store.select(currentFocusedNodePathSelector)
    readonly hoveredNodeId$ = this.store.select(hoveredNodeIdSelector)
    readonly markedPackages$ = this.store.select(markedPackagesSelector)
    readonly rightClickedNodeData$ = this.store.select(rightClickedNodeDataSelector)
    readonly searchPattern$ = this.store.select(searchPatternSelector)
    readonly selectedNodePath$ = this.store.select(selectedNodePathSelector)

    getSharedView(): SharedView {
        return this.state.getValue().sharedView
    }

    getExcludedNodes(): ExcludedNode[] {
        return this.state.getValue().sharedView.excludedNodes
    }

    getFlattenedNodes(): FlattenedNode[] {
        return this.state.getValue().sharedView.flattenedNodes
    }

    getHoveredNodeId(): string | null {
        return this.state.getValue().sharedView.hoveredNodeId
    }
}
