import {
	setShowOnlyBuildingsWithEdges,
	ShowOnlyBuildingsWithEdgesAction,
	ShowOnlyBuildingsWithEdgesActions
} from "./showOnlyBuildingsWithEdges.actions"

export function showOnlyBuildingsWithEdges(state = setShowOnlyBuildingsWithEdges().payload, action: ShowOnlyBuildingsWithEdgesAction) {
	switch (action.type) {
		case ShowOnlyBuildingsWithEdgesActions.SET_SHOW_ONLY_BUILDINGS_WITH_EDGES:
			return action.payload
		default:
			return state
	}
}
