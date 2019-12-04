import { CCAction } from "../../../../codeCharta.model"

export enum HideFlatBuildingsActions {
	SET_HIDE_FLAT_BUILDINGS = "SET_HIDE_FLAT_BUILDINGS"
}

export interface SetHideFlatBuildingsAction extends CCAction {
	type: HideFlatBuildingsActions.SET_HIDE_FLAT_BUILDINGS
	payload: boolean
}

export type HideFlatBuildingsAction = SetHideFlatBuildingsAction

export function setHideFlatBuildings(hideFlatBuildings: boolean = true): SetHideFlatBuildingsAction {
	return {
		type: HideFlatBuildingsActions.SET_HIDE_FLAT_BUILDINGS,
		payload: hideFlatBuildings
	}
}
