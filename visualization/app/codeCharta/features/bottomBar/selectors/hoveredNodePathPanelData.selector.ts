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

/**
 * The path of the node currently being LOOKED AT rather than hovered: the selected node, falling back to
 * the map root. Views without a hoverable map (the domain word cloud) show this so the status bar always
 * states which node's data is on screen — the same selected-node-then-root resolution the domain lens uses.
 */
export const selectedNodePathPanelDataSelector = createSelector(
    selectedNodeSelector,
    accumulatedDataSelector,
    (selectedNode, accumulatedData) => _getHoveredNodePathPanelData(selectedNode ?? accumulatedData?.unifiedMapNode)
)

/**
 * The same "node being looked at" panel data, but resolved from a PARAMETER path rather than the global
 * `sharedView` selection — for a view that owns its selection (the domain word cloud). A `null` path falls
 * back to the map root, exactly like the global variant.
 */
export const createSelectedNodePathPanelDataSelector = (selectedNodePath: string | null) =>
    createSelector(createNodeByPathSelector(selectedNodePath), accumulatedDataSelector, (selectedNode, accumulatedData) =>
        _getHoveredNodePathPanelData(selectedNode ?? accumulatedData?.unifiedMapNode)
    )
