import { createSelector } from "../../../../state/angular-redux/createSelector"
import { searchPatternSelector } from "../../../../state/store/dynamicSettings/searchPattern/searchPattern.selector"

export const _isSearchPatternEmpty = (searchPattern: string) => searchPattern === "" || searchPattern === "!" || searchPattern === ","

export const isSearchPatternEmptySelector = createSelector([searchPatternSelector], _isSearchPatternEmpty)
