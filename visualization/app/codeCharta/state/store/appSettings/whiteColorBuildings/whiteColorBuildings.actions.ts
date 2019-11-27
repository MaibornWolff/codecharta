import { Action } from "redux"

export enum WhiteColorBuildingsActions {
	SET_WHITE_COLOR_BUILDINGS = "SET_WHITE_COLOR_BUILDINGS"
}

export interface SetWhiteColorBuildingsAction extends Action {
	type: WhiteColorBuildingsActions.SET_WHITE_COLOR_BUILDINGS
	payload: boolean
}

export type WhiteColorBuildingsAction = SetWhiteColorBuildingsAction

export function setWhiteColorBuildings(whiteColorBuildings: boolean): WhiteColorBuildingsAction {
	return {
		type: WhiteColorBuildingsActions.SET_WHITE_COLOR_BUILDINGS,
		payload: whiteColorBuildings
	}
}
