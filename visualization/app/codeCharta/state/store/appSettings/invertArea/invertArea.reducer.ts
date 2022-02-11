import { InvertAreaAction, InvertAreaActions, setInvertArea, ToggleInvertingAreaAction } from "./invertArea.actions"

export function invertArea(state = setInvertArea().payload, action: InvertAreaAction | ToggleInvertingAreaAction) {
	switch (action.type) {
		case InvertAreaActions.SET_INVERT_AREA:
			return action.payload
		case InvertAreaActions.TOGGLE_INVERTING_AREA:
			return !state
		default:
			return state
	}
}
