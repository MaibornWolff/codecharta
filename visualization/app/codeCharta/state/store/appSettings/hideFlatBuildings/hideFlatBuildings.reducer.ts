import { HideFlatBuildingsAction, HideFlatBuildingsActions } from "./hideFlatBuildings.actions"

export function hideFlatBuildings(state: boolean = true, action: HideFlatBuildingsAction): boolean {
	switch (action.type) {
		case HideFlatBuildingsActions.SET_HIDE_FLAT_BUILDINGS:
			return action.payload
		default:
			return state
	}
}
