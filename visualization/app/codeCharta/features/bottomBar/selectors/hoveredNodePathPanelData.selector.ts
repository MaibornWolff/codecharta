import { createSelector } from "@ngrx/store"
import { CodeMapNode } from "../../../model/codeCharta.model"
import {
    accumulatedDataSelector,
    createNodeByPathSelector,
    hoveredNodeSelector,
    selectedNodeSelector
} from "../../../renderer/renderModel/renderModel.facade"

export const _getHoveredNodePathPanelData = (hoveredNode?: Pick<CodeMapNode, "path" | "type">) =>
    hoveredNode && {
        path: hoveredNode.path.slice(1).split("/"),
        isFile: hoveredNode.type === "File"
    }

export const hoveredNodePathPanelDataSelector = createSelector(hoveredNodeSelector, _getHoveredNodePathPanelData)

export const selectedNodePathPanelDataSelector = createSelector(
    selectedNodeSelector,
    accumulatedDataSelector,
    (selectedNode, accumulatedData) => _getHoveredNodePathPanelData(selectedNode ?? accumulatedData?.unifiedMapNode)
)

export const createSelectedNodePathPanelDataSelector = (selectedNodePath: string | null) =>
    createSelector(createNodeByPathSelector(selectedNodePath), accumulatedDataSelector, (selectedNode, accumulatedData) =>
        _getHoveredNodePathPanelData(selectedNode ?? accumulatedData?.unifiedMapNode)
    )
