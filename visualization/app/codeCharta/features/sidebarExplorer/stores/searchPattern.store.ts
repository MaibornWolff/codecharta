import { Injectable } from "@angular/core"
import { Store } from "@ngrx/store"
import { BlacklistType, CcState } from "../../../codeCharta.model"
import { searchPatternSelector } from "../../../state/store/dynamicSettings/searchPattern/searchPattern.selector"
import { setSearchPattern } from "../../../state/store/dynamicSettings/searchPattern/searchPattern.actions"
import { blacklistSearchPattern } from "../../../state/effects/blacklistSearchPattern/blacklistSearchPattern.effect"
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
