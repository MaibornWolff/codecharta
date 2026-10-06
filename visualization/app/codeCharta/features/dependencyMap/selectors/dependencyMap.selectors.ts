import { createSelector } from "@ngrx/store"
import { dependencyDeclarationsSelector, dependencyLevelsSelector } from "../../../lenses/dependency/dependencyLens.facade"
import { buildLeveledTree, indexTree, levelPathOf } from "../../../renderer/dependencyGraph/dependencyGraph.facade"
import { accumulatedDataSelector, pathToNodeSelector, searchedNodePathsSelector } from "../../../renderer/renderModel/renderModel.facade"
import { visibleFileStatesSelector } from "../../../stores/fileStore/fileStore.facade"
import { currentFocusedNodePathSelector, searchPatternSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { isSearchPatternEmpty } from "../../sidebarExplorer/facade"

export const dependencyTreeSelector = createSelector(
    accumulatedDataSelector,
    pathToNodeSelector,
    currentFocusedNodePathSelector,
    dependencyLevelsSelector,
    dependencyDeclarationsSelector,
    ({ unifiedMapNode }, pathToNode, focusedNodePath, levels, { leaves }) => {
        const root = (focusedNodePath && pathToNode.get(focusedNodePath)) || unifiedMapNode
        return root ? buildLeveledTree(root, levels, leaves) : null
    }
)

const NO_LEVELS_ABOVE: number[] = []

/** Where the focused folder sits in the whole map, so the levels inside it keep counting from the root. */
export const focusedFolderLevelPathSelector = createSelector(
    accumulatedDataSelector,
    currentFocusedNodePathSelector,
    dependencyLevelsSelector,
    ({ unifiedMapNode }, focusedNodePath, levels) => {
        const wholeTree = focusedNodePath && unifiedMapNode ? buildLeveledTree(unifiedMapNode, levels) : null
        return (wholeTree && levelPathOf(indexTree(wholeTree), focusedNodePath)) ?? NO_LEVELS_ABOVE
    }
)

/** Excluding a node can move the tree's root, so the layout is kept for the loaded files and the focus instead. */
export const dependencyLayoutIdentitySelector = createSelector(
    visibleFileStatesSelector,
    currentFocusedNodePathSelector,
    (visibleFileStates, focusedNodePath) =>
        JSON.stringify({
            fileChecksums: visibleFileStates.map(({ file }) => file.fileMeta.fileChecksum).sort(),
            focusedNodePath: focusedNodePath ?? null
        })
)

export const isDependencyMapFocusedSelector = createSelector(currentFocusedNodePathSelector, Boolean)

export const dependencySearchedPathsOrNullSelector = createSelector(searchPatternSelector, searchedNodePathsSelector, (pattern, paths) =>
    isSearchPatternEmpty(pattern) ? null : paths
)
