import { createSelector } from "../../../angular-redux/createSelector"
import { appStatusSelector } from "../appStatus.selector"

export const hoveredNodeIdSelector = createSelector([appStatusSelector], appStatus => appStatus.hoveredNodeId)
