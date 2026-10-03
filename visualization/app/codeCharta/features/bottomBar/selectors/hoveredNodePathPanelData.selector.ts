import { createSelector } from "@ngrx/store"
import { CodeMapNode } from "../../../model/codeCharta.model"
import {
    accumulatedDataSelector,
    createNodeByPathSelector,
    focusedNodeSelector,
    hoveredNodeSelector,
    selectedNodeSelector
} from "../../../renderer/renderModel/renderModel.facade"

export const _getHoveredNodePathPanelData = (hoveredNode?: Pick<CodeMapNode, "path" | "type">) =>
    hoveredNode && {
        path: hoveredNode.path.slice(1).split("/"),
        isFile: hoveredNode.type === "File"
    }

export const hoveredNodePathPanelDataSelector = createSelector(hoveredNodeSelector, _getHoveredNodePathPanelData)

export const shownFolderSelector = createSelector(
    focusedNodeSelector,
    accumulatedDataSelector,
    (focusedNode, accumulatedData) => focusedNode ?? accumulatedData?.unifiedMapNode
)

export const selectedNodePathPanelDataSelector = createSelector(selectedNodeSelector, shownFolderSelector, (selectedNode, shownFolder) =>
    _getHoveredNodePathPanelData(selectedNode ?? shownFolder)
)

export const createSelectedNodePathPanelDataSelector = (selectedNodePath: string | null) =>
    createSelector(createNodeByPathSelector(selectedNodePath), shownFolderSelector, (selectedNode, shownFolder) =>
        _getHoveredNodePathPanelData(selectedNode ?? shownFolder)
    )
