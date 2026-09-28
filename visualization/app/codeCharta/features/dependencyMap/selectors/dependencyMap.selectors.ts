import { createSelector } from "@ngrx/store"
import { dependencyLevelsSelector } from "../../../lenses/dependency/dependencyLens.facade"
import { buildLeveledTree } from "../../../renderer/dependencyGraph/dependencyGraph.facade"
import { accumulatedDataSelector, pathToNodeSelector } from "../../../renderer/renderModel/renderModel.facade"
import { currentFocusedNodePathSelector } from "../../../stores/sharedView/sharedView.read.facade"

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
