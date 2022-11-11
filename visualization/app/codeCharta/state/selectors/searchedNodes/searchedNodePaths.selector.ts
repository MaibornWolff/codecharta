import { createSelector } from "../../angular-redux/createSelector"
import { searchedNodesSelector } from "./searchedNodes.selector"

export const searchedNodePathsSelector = createSelector([searchedNodesSelector], searchedNodes => new Set(searchedNodes.map(x => x.path)))
