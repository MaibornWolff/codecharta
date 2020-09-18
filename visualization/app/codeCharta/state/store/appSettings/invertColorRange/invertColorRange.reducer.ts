import { InvertColorRangeAction, InvertColorRangeActions, setInvertColorRange } from "./invertColorRange.actions"

export function invertColorRange(state = setInvertColorRange().payload, action: InvertColorRangeAction) {
	switch (action.type) {
		case InvertColorRangeActions.SET_INVERT_COLOR_RANGE:
			return action.payload
		default:
			return state
	}
}
