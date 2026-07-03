import { createSelector } from "@ngrx/store"
import { searchPatternSelector, blacklistSelector } from "../../../../sharedView/sharedView.read.facade"
import { isPatternBlacklisted } from "../../../../util/blacklist/isPatternBlacklisted"
import { isSearchPatternEmptySelector } from "./isSearchPatternEmpty.selector"

export const isExcludePatternDisabledSelector = createSelector(
    searchPatternSelector,
    isSearchPatternEmptySelector,
    blacklistSelector,
    (searchPattern, isSearchPatternEmpty, blacklist) => {
        if (isSearchPatternEmpty) {
            return true
        }
        return isPatternBlacklisted(blacklist, "exclude", searchPattern)
    }
)
