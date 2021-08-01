import {
	SetSelectedBuildingIdPayload,
	SelectedBuildingIdActions,
	SetSelectedBuildingIdAction,
	setSelectedBuildingId
} from "./selectedBuildingId.actions"

export const selectedBuildingId = (
	state: SetSelectedBuildingIdPayload = setSelectedBuildingId().payload,
	action: Record<string, unknown> | SetSelectedBuildingIdAction
) => {
	switch (action.type) {
		case SelectedBuildingIdActions.SET_SELECTED_BUILDING_ID:
			return (<SetSelectedBuildingIdAction>action).payload
		default:
			return state
	}
}
