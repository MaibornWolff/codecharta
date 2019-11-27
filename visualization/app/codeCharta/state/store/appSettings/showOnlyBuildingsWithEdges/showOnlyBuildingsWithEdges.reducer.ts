import { ShowOnlyBuildingsWithEdgesAction, ShowOnlyBuildingsWithEdgesActions } from "./showOnlyBuildingsWithEdges.actions"

export function showOnlyBuildingsWithEdges(state: boolean = false, action: ShowOnlyBuildingsWithEdgesAction): boolean {
	switch (action.type) {
		case ShowOnlyBuildingsWithEdgesActions.SET_SHOW_ONLY_BUILDINGS_WITH_EDGES:
			return action.payload
		default:
			return state
	}
}
