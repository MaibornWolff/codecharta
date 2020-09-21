import { MarginAction, MarginActions, setMargin } from "./margin.actions"

export function margin(state = setMargin().payload, action: MarginAction) {
	switch (action.type) {
		case MarginActions.SET_MARGIN:
			return action.payload
		default:
			return state
	}
}
