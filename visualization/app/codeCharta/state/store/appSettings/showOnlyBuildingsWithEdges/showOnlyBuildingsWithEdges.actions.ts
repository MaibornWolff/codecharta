import { CCAction } from "../../../../codeCharta.model"

export enum ShowOnlyBuildingsWithEdgesActions {
	SET_SHOW_ONLY_BUILDINGS_WITH_EDGES = "SET_SHOW_ONLY_BUILDINGS_WITH_EDGES"
}

export interface SetShowOnlyBuildingsWithEdgesAction extends CCAction {
	type: ShowOnlyBuildingsWithEdgesActions.SET_SHOW_ONLY_BUILDINGS_WITH_EDGES
	payload: boolean
}

export type ShowOnlyBuildingsWithEdgesAction = SetShowOnlyBuildingsWithEdgesAction

export function setShowOnlyBuildingsWithEdges(showOnlyBuildingsWithEdges: boolean = false): SetShowOnlyBuildingsWithEdgesAction {
	return {
		type: ShowOnlyBuildingsWithEdgesActions.SET_SHOW_ONLY_BUILDINGS_WITH_EDGES,
		payload: showOnlyBuildingsWithEdges
	}
}
