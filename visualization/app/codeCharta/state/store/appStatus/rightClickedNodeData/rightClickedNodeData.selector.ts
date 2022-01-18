import { createSelector } from "../../../angular-redux/createSelector"
import { appStatusSelector } from "../appStatus.selector"

export const rightClickedNodeDataSelector = createSelector([appStatusSelector], appStatus => appStatus.rightClickedNodeData)
