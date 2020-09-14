import { MapColorsAction, MapColorsActions, setMapColors } from "./mapColors.actions"

export function mapColors(state = setMapColors().payload, action: MapColorsAction) {
	switch (action.type) {
		case MapColorsActions.SET_MAP_COLORS:
			return { ...state, ...action.payload }
		default:
			return state
	}
}
