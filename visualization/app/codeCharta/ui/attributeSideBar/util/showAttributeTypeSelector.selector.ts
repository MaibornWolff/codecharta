import { createSelector } from "../../../state/angular-redux/createSelector"
import { selectedNodeSelector } from "../../../state/selectors/selectedNode.selector"
import { isLeaf, MaybeLeaf } from "../../../util/codeMapHelper"

export const _shouldShowAttributeType = (node?: MaybeLeaf) => node && !isLeaf(node)

export const showAttributeTypeSelectorSelector = createSelector([selectedNodeSelector], _shouldShowAttributeType)
