import { createSelector } from "@ngrx/store"
import { hoveredNodeSelector } from "../../../state/selectors/hoveredNode.selector"
import { isLeaf } from "../../../util/codeMapHelper"

export const _isHoveredNodeALeaf = hoveredNode => hoveredNode && isLeaf(hoveredNode)

export const isHoveredNodeALeafSelector = createSelector(hoveredNodeSelector, _isHoveredNodeALeaf)
