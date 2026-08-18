import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { BlacklistItem, BlacklistType, CcState } from "../../../model/codeCharta.model"
import { removeBlacklistItem } from "../../../stores/sharedView/sharedView.write.facade"
import { dispatchAfterPaint } from "../../../util/dispatchAfterPaint"
import { blacklistSearchPattern } from "../effects/blacklistSearchPattern/blacklistSearchPattern.effect"

@Injectable({
    providedIn: "root"
})
export class SidebarExplorerWriteStore {
    constructor(private readonly store: Store<CcState>) {}

    removeBlacklistItem(item: BlacklistItem) {
        dispatchAfterPaint(this.store, removeBlacklistItem({ item }))
    }

    blacklistSearchPattern(type: BlacklistType) {
        dispatchAfterPaint(this.store, blacklistSearchPattern(type))
    }
}
