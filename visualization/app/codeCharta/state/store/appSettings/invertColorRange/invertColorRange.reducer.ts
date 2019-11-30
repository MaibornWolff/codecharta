import { InvertColorRangeAction, InvertColorRangeActions } from "./invertColorRange.actions"

export function invertColorRange(state: boolean = false, action: InvertColorRangeAction): boolean {
	switch (action.type) {
		case InvertColorRangeActions.SET_INVERT_COLOR_RANGE:
			return action.payload
		default:
			return state
	}
}
