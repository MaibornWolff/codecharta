import { createSelector } from "@ngrx/store"
import { isSearchPatternEmpty } from "../../../features/sidebarExplorer/facade"
import { searchPatternSelector } from "../../../stores/sharedView/sharedView.read.facade"

export const isSearchPatternEmptySelector = createSelector(searchPatternSelector, isSearchPatternEmpty)
