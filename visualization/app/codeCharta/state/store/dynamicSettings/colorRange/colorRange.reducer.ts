import { ColorRangeAction, ColorRangeActions, defaultColorRange } from "./colorRange.actions"

export function colorRange(state = defaultColorRange, action: ColorRangeAction) {
	switch (action.type) {
		case ColorRangeActions.SET_COLOR_RANGE:
			return { ...state, ...action.payload }
		default:
			return state
	}
}
