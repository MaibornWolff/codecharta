import { CCAction, MapColors } from "../../../../codeCharta.model"

export enum MapColorsActions {
	SET_MAP_COLORS = "SET_MAP_COLORS"
}

export interface SetMapColorsAction extends CCAction {
	type: MapColorsActions.SET_MAP_COLORS
	payload: MapColors
}

export type MapColorsAction = SetMapColorsAction

export function setMapColors(mapColors: MapColors): MapColorsAction {
	return {
		type: MapColorsActions.SET_MAP_COLORS,
		payload: mapColors
	}
}
