import { MapColors } from "../../../../codeCharta.model"
import { defaultMapColors, MapColorsAction, MapColorsActions, setMapColors } from "./mapColors.actions"

export function mapColors(state: MapColors = defaultMapColors, action: MapColorsAction) {
	if (isSetMapColorsAction(action)) {
		return { ...state, ...action.payload }
	}
	if (action.type === MapColorsActions.INVERT_COLOR_RANGE) {
		return {
			...state,
			positive: state.negative,
			negative: state.positive
		}
	}
	if (action.type === MapColorsActions.INVERT_DELTA_COLORS) {
		return {
			...state,
			positiveDelta: state.negativeDelta,
			negativeDelta: state.positiveDelta
		}
	}
	return state
}

function isSetMapColorsAction(action: MapColorsAction): action is ReturnType<typeof setMapColors> {
	return action.type === MapColorsActions.SET_MAP_COLORS
}
