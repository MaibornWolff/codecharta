import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { BlacklistType, CcState } from "../../../model/codeCharta.model"
import { searchPatternSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { setSearchPattern } from "../../../stores/sharedView/sharedView.write.facade"
import { blacklistSearchPattern } from "../effects/blacklistSearchPattern/blacklistSearchPattern.effect"
import { dispatchAfterPaint } from "../../../util/dispatchAfterPaint"
import { isSearchPatternEmptySelector } from "../selectors/searchBar/isSearchPatternEmpty.selector"
import { isFlattenPatternDisabledSelector } from "../selectors/searchBar/isFlattenPatternDisabled.selector"
import { isExcludePatternDisabledSelector } from "../selectors/searchBar/isExcludePatternDisabled.selector"

@Injectable({
    providedIn: "root"
})
export class SearchPatternStore {
    constructor(private readonly store: Store<CcState>) {}

    searchPattern$ = this.store.select(searchPatternSelector)
    isSearchPatternEmpty$ = this.store.select(isSearchPatternEmptySelector)
    isFlattenPatternDisabled$ = this.store.select(isFlattenPatternDisabledSelector)
    isExcludePatternDisabled$ = this.store.select(isExcludePatternDisabledSelector)

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
