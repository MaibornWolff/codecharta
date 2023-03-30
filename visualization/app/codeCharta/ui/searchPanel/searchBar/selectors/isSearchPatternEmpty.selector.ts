import { createSelector } from "@ngrx/store"
import { searchPatternSelector } from "../../../../state/store/dynamicSettings/searchPattern/searchPattern.selector"

export const _isSearchPatternEmpty = (searchPattern: string) => searchPattern === "" || searchPattern === "!" || searchPattern === ","

export const isSearchPatternEmptySelector = createSelector(searchPatternSelector, _isSearchPatternEmpty)
