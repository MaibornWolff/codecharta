import { Action } from "redux"

export enum HideFlatBuildingsActions {
	SET_HIDE_FLAT_BUILDINGS = "SET_HIDE_FLAT_BUILDINGS"
}

export interface SetHideFlatBuildingsAction extends Action {
	type: HideFlatBuildingsActions.SET_HIDE_FLAT_BUILDINGS
	payload: boolean
}

export type HideFlatBuildingsAction = SetHideFlatBuildingsAction

export function setHideFlatBuildings(hideFlatBuildings: boolean): HideFlatBuildingsAction {
	return {
		type: HideFlatBuildingsActions.SET_HIDE_FLAT_BUILDINGS,
		payload: hideFlatBuildings
	}
}
