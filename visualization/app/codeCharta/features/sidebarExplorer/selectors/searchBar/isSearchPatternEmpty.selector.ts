import { createSelector } from "@ngrx/store"
import { searchPatternSelector } from "../../../../sharedView/sharedView.facade"

export const _isSearchPatternEmpty = (searchPattern: string) => searchPattern === "" || searchPattern === "!" || searchPattern === ","

export const isSearchPatternEmptySelector = createSelector(searchPatternSelector, _isSearchPatternEmpty)
