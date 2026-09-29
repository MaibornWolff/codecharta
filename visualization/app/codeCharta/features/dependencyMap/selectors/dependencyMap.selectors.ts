import { createSelector } from "@ngrx/store"
import { dependencyLevelsSelector } from "../../../lenses/dependency/dependencyLens.facade"
import { buildLeveledTree } from "../../../renderer/dependencyGraph/dependencyGraph.facade"
import { accumulatedDataSelector, pathToNodeSelector, searchedNodePathsSelector } from "../../../renderer/renderModel/renderModel.facade"
import { currentFocusedNodePathSelector, searchPatternSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { isSearchPatternEmpty } from "../../sidebarExplorer/facade"

/** The graph follows the map's focus and exclusions, so a folder focused or a file excluded on the map
 * is focused or left out here too. */
export const dependencyTreeSelector = createSelector(
    accumulatedDataSelector,
    pathToNodeSelector,
    currentFocusedNodePathSelector,
    dependencyLevelsSelector,
    ({ unifiedMapNode }, pathToNode, focusedNodePath, levels) => {
        const root = (focusedNodePath && pathToNode.get(focusedNodePath)) || unifiedMapNode
        return root ? buildLeveledTree(root, levels) : null
    }
)

/** The explorer's search, shared with the metrics view, fades in the graph what it misses; null while no
 * search is on. */
export const dependencySearchedPathsSelector = createSelector(searchPatternSelector, searchedNodePathsSelector, (pattern, paths) =>
    isSearchPatternEmpty(pattern) ? null : paths
)
