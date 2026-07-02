import { createSelector } from "@ngrx/store"
import { searchPatternSelector } from "../../../../sharedView/sharedView.facade"
import { blacklistSelector } from "../../../../state/store/fileSettings/blacklist/blacklist.selector"
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
