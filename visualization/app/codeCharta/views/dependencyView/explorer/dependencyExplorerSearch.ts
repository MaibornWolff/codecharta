import { createSelector } from "@ngrx/store"
import { ExplorerSearchConfig, isSearchPatternEmpty } from "../../../features/sidebarExplorer/facade"
import { searchedNodePathsSelector } from "../../../renderer/renderModel/renderModel.facade"
import { searchPatternSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { setSearchPattern } from "../../../stores/sharedView/sharedView.write.facade"

// The metrics view's search, shared: a pattern typed in either view stays when switching to the other.
export const DEPENDENCY_EXPLORER_SEARCH: ExplorerSearchConfig = {
    patternSelector: searchPatternSelector,
    setPattern: setSearchPattern,
    isPatternEmptySelector: createSelector(searchPatternSelector, isSearchPatternEmpty),
    searchedNodePathsSelector
}
