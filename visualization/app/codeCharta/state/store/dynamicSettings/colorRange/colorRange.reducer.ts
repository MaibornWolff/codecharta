import { ColorRangeAction, ColorRangeActions, setColorRange } from "./colorRange.actions"

export function colorRange(state = setColorRange().payload, action: ColorRangeAction) {
	switch (action.type) {
		case ColorRangeActions.SET_COLOR_RANGE:
			return action.payload
		default:
			return state
	}
}
