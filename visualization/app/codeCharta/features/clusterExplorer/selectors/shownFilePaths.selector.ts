import { createSelector } from "@ngrx/store"
import { CodeMapNode } from "../../../model/codeCharta.model"
import { codeMapNodesSelector } from "../../../renderer/renderModel/renderModel.facade"
import { currentFocusedNodePathSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { isLeaf } from "../../../util/codeMapHelper"

export const _shownFilePaths = (nodes: CodeMapNode[], focusedNodePath: string | undefined): ReadonlySet<string> => {
    const paths = new Set<string>()
    for (const node of nodes) {
        const isInFocus = !focusedNodePath || node.path === focusedNodePath || node.path.startsWith(`${focusedNodePath}/`)
        if (isLeaf(node) && !node.isExcluded && isInFocus) {
            paths.add(node.path)
        }
    }
    return paths
}

export const shownFilePathsSelector = createSelector(codeMapNodesSelector, currentFocusedNodePathSelector, _shownFilePaths)
