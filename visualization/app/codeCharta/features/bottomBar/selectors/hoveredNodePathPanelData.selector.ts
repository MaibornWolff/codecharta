import { createSelector } from "@ngrx/store"
import { CodeMapNode } from "../../../model/codeCharta.model"
import { hoveredNodeSelector } from "../../../renderer/renderModel/renderModel.facade"

export const _getHoveredNodePathPanelData = (hoveredNode?: Pick<CodeMapNode, "path" | "type">) =>
    hoveredNode && {
        path: hoveredNode.path.slice(1).split("/"),
        isFile: hoveredNode.type === "File"
    }

export const hoveredNodePathPanelDataSelector = createSelector(hoveredNodeSelector, _getHoveredNodePathPanelData)
