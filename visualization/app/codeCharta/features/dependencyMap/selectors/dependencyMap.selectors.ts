import { createSelector } from "@ngrx/store"
import { dependencyDeclarationsSelector, dependencyLevelsSelector } from "../../../lenses/dependency/dependencyLens.facade"
import { FileState } from "../../../model/files/files"
import { buildLeveledTree } from "../../../renderer/dependencyGraph/dependencyGraph.facade"
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

function sortedChecksumsOf(visibleFileStates: FileState[]): string[] {
    return visibleFileStates
        .map(({ file }) => file.fileMeta.fileChecksum)
        .toSorted((checksumA, checksumB) => checksumA.localeCompare(checksumB))
}

/** What the reader opened and moved is kept for as long as the same files are loaded. */
export const dependencyLoadedFilesIdentitySelector = createSelector(visibleFileStatesSelector, visibleFileStates =>
    JSON.stringify(sortedChecksumsOf(visibleFileStates))
)

/** Excluding a node can move the tree's root, so the layout is kept for the loaded files and the focus instead. */
export const dependencyLayoutIdentitySelector = createSelector(
    visibleFileStatesSelector,
    currentFocusedNodePathSelector,
    (visibleFileStates, focusedNodePath) =>
        JSON.stringify({ fileChecksums: sortedChecksumsOf(visibleFileStates), focusedNodePath: focusedNodePath ?? null })
)

export const isDependencyMapFocusedSelector = createSelector(currentFocusedNodePathSelector, Boolean)

export const dependencySearchedPathsOrNullSelector = createSelector(searchPatternSelector, searchedNodePathsSelector, (pattern, paths) =>
    isSearchPatternEmpty(pattern) ? null : paths
)
