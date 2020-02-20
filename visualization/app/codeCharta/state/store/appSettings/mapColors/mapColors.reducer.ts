import { MapColorsAction, MapColorsActions, setMapColors } from "./mapColors.actions"
import { MapColors } from "../../../../codeCharta.model"

export function mapColors(state: MapColors = setMapColors().payload, action: MapColorsAction): MapColors {
	switch (action.type) {
		case MapColorsActions.SET_MAP_COLORS:
			return { ...state, ...action.payload }
		default:
			return state
	}
}
