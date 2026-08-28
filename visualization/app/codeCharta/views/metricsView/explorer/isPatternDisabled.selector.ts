import { createSelector } from "@ngrx/store"
import { BlacklistType } from "../../../model/codeCharta.model"
import { blacklistSelector, searchPatternSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { isPatternBlacklisted } from "../../../util/blacklist/isPatternBlacklisted"
import { isSearchPatternEmptySelector } from "./isSearchPatternEmpty.selector"

const createIsPatternDisabledSelector = (type: BlacklistType) =>
    createSelector(
        searchPatternSelector,
        isSearchPatternEmptySelector,
        blacklistSelector,
        (searchPattern, isSearchPatternEmpty, blacklist) => isSearchPatternEmpty || isPatternBlacklisted(blacklist, type, searchPattern)
    )

export const isFlattenPatternDisabledSelector = createIsPatternDisabledSelector("flatten")

export const isExcludePatternDisabledSelector = createIsPatternDisabledSelector("exclude")
