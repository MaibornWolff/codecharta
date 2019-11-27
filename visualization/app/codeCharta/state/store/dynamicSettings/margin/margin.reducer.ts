import { MarginAction, MarginActions } from "./margin.actions"

export function margin(state: number = null, action: MarginAction): number {
	switch (action.type) {
		case MarginActions.SET_MARGIN:
			return action.payload
		default:
			return state
	}
}
