import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { CcState } from "../../../model/codeCharta.model"
import { blacklistSelector } from "./blacklist/blacklist.selector"
import { blacklistMatcherSelector } from "./blacklist/blacklistMatcher.selector"
import { currentFocusedNodePathSelector } from "./focusedNodePath/currentFocused.selector"
import { focusedNodePathSelector } from "./focusedNodePath/focusedNodePath.selector"
import { hoveredNodeIdSelector } from "./hoveredNodeId/hoveredNodeId.selector"
import { markedPackagesSelector } from "./markedPackages/markedPackages.selector"
import { rightClickedNodeDataSelector } from "./rightClickedNodeData/rightClickedNodeData.selector"
import { searchPatternSelector } from "./searchPattern/searchPattern.selector"
import { selectedBuildingIdSelector } from "./selectedBuildingId/selectedBuildingId.selector"

@Injectable({
    providedIn: "root"
})
export class SharedViewReadWindow {
    constructor(private readonly store: Store<CcState>) {}

    readonly blacklist$ = this.store.select(blacklistSelector)
    readonly blacklistMatcher$ = this.store.select(blacklistMatcherSelector)
    readonly focusedNodePath$ = this.store.select(focusedNodePathSelector)
    readonly currentFocusedNodePath$ = this.store.select(currentFocusedNodePathSelector)
    readonly hoveredNodeId$ = this.store.select(hoveredNodeIdSelector)
    readonly markedPackages$ = this.store.select(markedPackagesSelector)
    readonly rightClickedNodeData$ = this.store.select(rightClickedNodeDataSelector)
    readonly searchPattern$ = this.store.select(searchPatternSelector)
    readonly selectedBuildingId$ = this.store.select(selectedBuildingIdSelector)
}
