import {
	SetSelectedBuildingIdPayload,
	SelectedBuildingIdActions,
	SetSelectedBuildingIdAction,
	setSelectedBuildingId
} from "./selectedBuildingId.actions"

export const selectedBuildingId = (
	state: SetSelectedBuildingIdPayload = setSelectedBuildingId().payload,
	action: SetSelectedBuildingIdAction
) => {
	switch (action.type) {
		case SelectedBuildingIdActions.SET_SELECTED_BUILDING_ID:
			return action.payload
		default:
			return state
	}
}
