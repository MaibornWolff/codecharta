import { createSelector } from "@ngrx/store"
import { searchPatternSelector } from "../../../../stores/sharedView/sharedView.read.facade"

export const _isSearchPatternEmpty = (searchPattern: string) => searchPattern === "" || searchPattern === "!" || searchPattern === ","

export const isSearchPatternEmptySelector = createSelector(searchPatternSelector, _isSearchPatternEmpty)
