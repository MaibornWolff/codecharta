import { defaultMargin, MarginAction, MarginActions } from "./margin.actions"

export function margin(state = defaultMargin, action: MarginAction) {
	switch (action.type) {
		case MarginActions.SET_MARGIN:
			return action.payload
		default:
			return state
	}
}
