import { createSelector } from "../angular-redux/store"
import { selectedBuildingSelector } from "./selectedBuilding.selector"

export const selectedNodeSelector = createSelector([selectedBuildingSelector], selectedBuilding => selectedBuilding?.node)
