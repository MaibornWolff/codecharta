import { setShowOnlyBuildingsWithEdges } from "./showOnlyBuildingsWithEdges.actions"

export function splitShowOnlyBuildingsWithEdgesAction(payload: boolean) {
	return setShowOnlyBuildingsWithEdges(payload)
}
