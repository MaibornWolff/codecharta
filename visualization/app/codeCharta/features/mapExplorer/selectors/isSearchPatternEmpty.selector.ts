import { createSelector } from "@ngrx/store"
import { searchPatternSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { isSearchPatternEmpty } from "../../sidebarExplorer/facade"

export const isSearchPatternEmptySelector = createSelector(searchPatternSelector, isSearchPatternEmpty)
