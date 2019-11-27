import { InvertDeltaColorsAction, InvertDeltaColorsActions } from "./invertDeltaColors.actions"

export function invertDeltaColors(state: boolean = false, action: InvertDeltaColorsAction): boolean {
	switch (action.type) {
		case InvertDeltaColorsActions.SET_INVERT_DELTA_COLORS:
			return action.payload
		default:
			return state
	}
}
