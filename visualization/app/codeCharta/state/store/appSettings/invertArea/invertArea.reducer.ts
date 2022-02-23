import { InvertAreaAction, InvertAreaActions, setInvertArea } from "./invertArea.actions"

export function invertArea(state = setInvertArea().payload, action: InvertAreaAction) {
	switch (action.type) {
		case InvertAreaActions.SET_INVERT_AREA:
			return action.payload
		default:
			return state
	}
}
