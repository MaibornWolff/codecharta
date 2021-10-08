import {
	SetHoveredBuildingPathPayload,
	defaultHoveredBuildingPath,
	HoveredBuildingPathActions,
	SetHoveredBuildingPathAction
} from "./hoveredBuildingPath.actions"

export const hoveredBuildingPath = (
	state: SetHoveredBuildingPathPayload = defaultHoveredBuildingPath,
	action: SetHoveredBuildingPathAction
) => {
	switch (action.type) {
		case HoveredBuildingPathActions.SET_HOVERED_BUILDING_PATH:
			return action.payload
		default:
			return state
	}
}
