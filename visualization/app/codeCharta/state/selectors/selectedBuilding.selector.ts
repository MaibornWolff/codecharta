import { createSelector } from "../angular-redux/store"
import { selectedBuildingIdSelector } from "../store/appStatus/selectedBuildingId/selectedBuildingId.selector"
import { idToBuildingSelector } from "../store/lookUp/idToBuilding/idToBuilding.selector"

export const selectedBuildingSelector = createSelector(
	[selectedBuildingIdSelector, idToBuildingSelector],
	(selectedBuildingId, idToBuilding) => idToBuilding.get(selectedBuildingId)
)
