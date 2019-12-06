import { MarginAction, MarginActions, setMargin } from "./margin.actions"

export function margin(state: number = setMargin().payload, action: MarginAction): number {
	switch (action.type) {
		case MarginActions.SET_MARGIN:
			return action.payload
		default:
			return state
	}
}
