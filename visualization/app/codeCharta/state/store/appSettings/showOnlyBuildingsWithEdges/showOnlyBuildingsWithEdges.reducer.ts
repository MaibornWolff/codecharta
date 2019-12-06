import {
	setShowOnlyBuildingsWithEdges,
	ShowOnlyBuildingsWithEdgesAction,
	ShowOnlyBuildingsWithEdgesActions
} from "./showOnlyBuildingsWithEdges.actions"

export function showOnlyBuildingsWithEdges(
	state: boolean = setShowOnlyBuildingsWithEdges().payload,
	action: ShowOnlyBuildingsWithEdgesAction
): boolean {
	switch (action.type) {
		case ShowOnlyBuildingsWithEdgesActions.SET_SHOW_ONLY_BUILDINGS_WITH_EDGES:
			return action.payload
		default:
			return state
	}
}
