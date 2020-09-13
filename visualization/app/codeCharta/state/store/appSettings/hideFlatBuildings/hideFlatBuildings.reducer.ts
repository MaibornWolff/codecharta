import { HideFlatBuildingsAction, HideFlatBuildingsActions, setHideFlatBuildings } from "./hideFlatBuildings.actions"

export function hideFlatBuildings(state: boolean = setHideFlatBuildings().payload, action: HideFlatBuildingsAction) {
	switch (action.type) {
		case HideFlatBuildingsActions.SET_HIDE_FLAT_BUILDINGS:
			return action.payload
		default:
			return state
	}
}
