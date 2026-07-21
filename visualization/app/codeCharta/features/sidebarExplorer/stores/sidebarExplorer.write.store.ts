import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { BlacklistItem, BlacklistType, CcState } from "../../../model/codeCharta.model"
import { removeBlacklistItem, setSearchPattern } from "../../../stores/sharedView/sharedView.write.facade"
import { dispatchAfterPaint } from "../../../util/dispatchAfterPaint"
import { blacklistSearchPattern } from "../effects/blacklistSearchPattern/blacklistSearchPattern.effect"

/**
 * Write surface of the explorer's own chrome: the blacklist and search pattern. Sorting is now owned by the
 * per-view EXPLORER_SORT port (so each view sorts independently), and selection/hover/right-click by the
 * EXPLORER_SELECTION / EXPLORER_CONTEXT_MENU ports — so the generic explorer never broadcasts view state.
 */
@Injectable({
    providedIn: "root"
})
export class SidebarExplorerWriteStore {
    constructor(private readonly store: Store<CcState>) {}

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
}
