import { DynamicMarginAction, DynamicMarginActions } from "./dynamicMargin.actions"

export function dynamicMargin(state: boolean = true, action: DynamicMarginAction): boolean {
	switch (action.type) {
		case DynamicMarginActions.SET_DYNAMIC_MARGIN:
			return action.payload
		default:
			return state
	}
}
