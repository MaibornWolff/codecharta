import { CCAction } from "../../../../model/codeCharta.model"

export enum WhiteColorBuildingsActions {
	SET_WHITE_COLOR_BUILDINGS = "SET_WHITE_COLOR_BUILDINGS"
}

export interface SetWhiteColorBuildingsAction extends CCAction {
	type: WhiteColorBuildingsActions.SET_WHITE_COLOR_BUILDINGS
	payload: boolean
}

export type WhiteColorBuildingsAction = SetWhiteColorBuildingsAction

export function setWhiteColorBuildings(whiteColorBuildings: boolean = defaultWhiteColorBuildings): SetWhiteColorBuildingsAction {
	return {
		type: WhiteColorBuildingsActions.SET_WHITE_COLOR_BUILDINGS,
		payload: whiteColorBuildings
	}
}

export const defaultWhiteColorBuildings = false
