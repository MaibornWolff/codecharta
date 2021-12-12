import { MapColors } from "../../../../codeCharta.model"
import { defaultMapColors, MapColorsAction, MapColorsActions } from "./mapColors.actions"

export function mapColors(state: MapColors = defaultMapColors, action: MapColorsAction) {
	switch (action.type) {
		case MapColorsActions.SET_MAP_COLORS:
			return { ...state, ...action.payload }
		default:
			return state
	}
}
