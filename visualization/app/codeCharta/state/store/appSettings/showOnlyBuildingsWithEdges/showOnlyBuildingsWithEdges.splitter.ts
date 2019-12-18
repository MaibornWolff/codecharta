import { setShowOnlyBuildingsWithEdges, ShowOnlyBuildingsWithEdgesAction } from "./showOnlyBuildingsWithEdges.actions"

export function splitShowOnlyBuildingsWithEdgesAction(payload: boolean): ShowOnlyBuildingsWithEdgesAction {
	return setShowOnlyBuildingsWithEdges(payload)
}
