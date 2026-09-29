import { searchedNodePathsSelector } from "../../renderer/renderModel/renderModel.facade"
import { searchPatternSelector } from "../../stores/sharedView/sharedView.read.facade"
import { setSearchPattern } from "../../stores/sharedView/sharedView.write.facade"
import { ExplorerSearchConfig } from "../sidebarExplorer/facade"
import { isSearchPatternEmptySelector } from "./selectors/isSearchPatternEmpty.selector"

// The pattern lives in the shared view state: it dims buildings in the 3D map and stays when switching between the map views.
export const MAP_EXPLORER_SEARCH: ExplorerSearchConfig = {
    patternSelector: searchPatternSelector,
    setPattern: setSearchPattern,
    isPatternEmptySelector: isSearchPatternEmptySelector,
    searchedNodePathsSelector
}
