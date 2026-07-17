import { createSelector } from "@ngrx/store"
import { hierarchy } from "d3-hierarchy"
import { CodeMapNode, NodeType } from "../../../model/codeCharta.model"
import { accumulatedDataSelector } from "../../../renderer/renderModel/renderModel.facade"

export const _collectFolderPaths = (unifiedMapNode: CodeMapNode | undefined): string[] => {
    if (!unifiedMapNode) {
        return []
    }
    const folderPaths: string[] = []
    for (const { data } of hierarchy(unifiedMapNode)) {
        if (data.type === NodeType.FOLDER && !data.isExcluded) {
            folderPaths.push(data.path)
        }
    }
    return folderPaths.sort((a, b) => a.localeCompare(b))
}

export const markableFolderPathsSelector = createSelector(accumulatedDataSelector, accumulatedData =>
    _collectFolderPaths(accumulatedData.unifiedMapNode)
)
