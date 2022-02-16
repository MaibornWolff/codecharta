import { createSelector } from "../../../angular-redux/createSelector"
import { lookUpSelector } from "../lookUp.selector"

export const idToNodeSelector = createSelector([lookUpSelector], lookUp => lookUp.idToNode)
