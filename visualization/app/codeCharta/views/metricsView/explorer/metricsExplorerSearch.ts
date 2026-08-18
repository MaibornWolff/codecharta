import { ExplorerSearchConfig, isSearchPatternEmptySelector } from "../../../features/sidebarExplorer/facade"
import { searchedNodePathsSelector } from "../../../renderer/renderModel/renderModel.facade"
import { searchPatternSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { setSearchPattern } from "../../../stores/sharedView/sharedView.write.facade"

// The map view's pattern also dims buildings in the 3D map, so its search reuses those shared selectors.
export const METRICS_EXPLORER_SEARCH: ExplorerSearchConfig = {
    patternSelector: searchPatternSelector,
    setPattern: setSearchPattern,
    isPatternEmptySelector: isSearchPatternEmptySelector,
    searchedNodePathsSelector
}
