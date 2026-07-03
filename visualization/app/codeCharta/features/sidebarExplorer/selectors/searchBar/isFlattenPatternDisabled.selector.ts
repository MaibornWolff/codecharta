import { createSelector } from "@ngrx/store"
import { searchPatternSelector } from "../../../../sharedView/sharedView.read.facade"
import { blacklistSelector } from "../../../../sharedView/sharedView.read.facade"
import { isPatternBlacklisted } from "../../../../util/blacklist/isPatternBlacklisted"
import { isSearchPatternEmptySelector } from "./isSearchPatternEmpty.selector"

export const isFlattenPatternDisabledSelector = createSelector(
    searchPatternSelector,
    isSearchPatternEmptySelector,
    blacklistSelector,
    (searchPattern, isSearchPatternEmpty, blacklist) => {
        if (isSearchPatternEmpty) {
            return true
        }
        return isPatternBlacklisted(blacklist, "flatten", searchPattern)
    }
)
