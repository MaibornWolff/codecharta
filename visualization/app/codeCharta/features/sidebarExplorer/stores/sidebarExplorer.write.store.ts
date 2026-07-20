import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { BlacklistItem, BlacklistType, CcState, SortingOption } from "../../../model/codeCharta.model"
import { setSortingOption, toggleSortingOrderAscending } from "../../../stores/preferences/preferences.write.facade"
import {
    removeBlacklistItem,
    setHoveredNodeId,
    setRightClickedNodeData,
    setSearchPattern,
    setSelectedBuildingId
} from "../../../stores/sharedView/sharedView.write.facade"
import { dispatchAfterPaint } from "../../../util/dispatchAfterPaint"
import { blacklistSearchPattern } from "../effects/blacklistSearchPattern/blacklistSearchPattern.effect"

type RightClickedNodeData = CcState["sharedView"]["rightClickedNodeData"]

@Injectable({
    providedIn: "root"
})
export class SidebarExplorerWriteStore {
    constructor(private readonly store: Store<CcState>) {}

    setHoveredNodeId(value: string | null) {
        this.store.dispatch(setHoveredNodeId({ value }))
    }

    /**
     * Selection by node PATH — the same value the 3D scene's selectBuilding writes. The explorer sets it
     * directly so selection drives consumers (e.g. the domain word cloud) even in views that render no 3D
     * map, where the building lookup that selectBuilding needs does not exist.
     */
    setSelectedBuildingId(value: string | null) {
        this.store.dispatch(setSelectedBuildingId({ value }))
    }

    setRightClickedNodeData(value: RightClickedNodeData) {
        this.store.dispatch(setRightClickedNodeData({ value }))
    }

    removeBlacklistItem(item: BlacklistItem) {
        dispatchAfterPaint(this.store, removeBlacklistItem({ item }))
    }

    setSearchPattern(value: string) {
        this.store.dispatch(setSearchPattern({ value }))
    }

    resetSearchPattern() {
        this.store.dispatch(setSearchPattern({ value: "" }))
    }

    blacklistSearchPattern(type: BlacklistType) {
        dispatchAfterPaint(this.store, blacklistSearchPattern(type))
    }

    setSortingOption(value: SortingOption) {
        this.store.dispatch(setSortingOption({ value }))
    }

    toggleSortingOrderAscending() {
        this.store.dispatch(toggleSortingOrderAscending())
    }
}
