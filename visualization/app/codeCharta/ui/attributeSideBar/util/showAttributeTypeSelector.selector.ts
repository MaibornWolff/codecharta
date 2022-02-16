import { Node } from "../../../codeCharta.model"
import { createSelector } from "../../../state/angular-redux/store"
import { selectedNodeSelector } from "../../../state/selectors/selectedNode.selector"

export const _shouldShowAttributeType = (node?: Pick<Node, "isLeaf">) => !node?.isLeaf

export const showAttributeTypeSelectorSelector = createSelector([selectedNodeSelector], _shouldShowAttributeType)
