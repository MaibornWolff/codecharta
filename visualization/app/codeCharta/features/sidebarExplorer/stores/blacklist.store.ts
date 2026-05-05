import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { BlacklistItem, CcState } from "../../../codeCharta.model"
import { removeBlacklistItem } from "../../../state/store/fileSettings/blacklist/blacklist.actions"
import { dispatchAfterPaint } from "../../../util/dispatchAfterPaint"
import { excludeRulesWithCountSelector, flattenRulesWithCountSelector } from "../selectors/sidebarExplorer.selectors"

@Injectable({
    providedIn: "root"
})
export class BlacklistStore {
    constructor(private readonly store: Store<CcState>) {}

    flattenRulesWithCount$ = this.store.select(flattenRulesWithCountSelector)
    excludeRulesWithCount$ = this.store.select(excludeRulesWithCountSelector)

    removeBlacklistItem(item: BlacklistItem) {
        dispatchAfterPaint(this.store, removeBlacklistItem({ item }))
    }
}
