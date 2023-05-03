import { createSelector } from "@ngrx/store"
import { Node } from "../../../codeCharta.model"
import { selectedNodeSelector } from "../../../state/selectors/selectedNode.selector"

export const _shouldShowDeltaValue = (node?: Pick<Node, "deltas">) => Boolean(node?.deltas)

export const showDeltaValueSelector = createSelector(selectedNodeSelector, _shouldShowDeltaValue)
