import { createSelector } from "@ngrx/store"
import { CodeMapNode, KeyValuePair } from "../../../model/codeCharta.model"
import { codeMapNodesSelector } from "../../../renderer/renderModel/renderModel.facade"
import { currentFocusedNodePathSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { isLeaf } from "../../../util/codeMapHelper"

export type ShownFiles = ReadonlyMap<string, KeyValuePair>

export const _shownFiles = (nodes: CodeMapNode[], focusedNodePath: string | undefined): ShownFiles => {
    const attributesByPath = new Map<string, KeyValuePair>()
    for (const node of nodes) {
        const isInFocus = !focusedNodePath || node.path === focusedNodePath || node.path.startsWith(`${focusedNodePath}/`)
        if (isLeaf(node) && !node.isExcluded && isInFocus) {
            attributesByPath.set(node.path, node.attributes)
        }
    }
    return attributesByPath
}

export const shownFilesSelector = createSelector(codeMapNodesSelector, currentFocusedNodePathSelector, _shownFiles)
