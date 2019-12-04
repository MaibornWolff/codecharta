import { DynamicMarginAction, DynamicMarginActions, setDynamicMargin } from "./dynamicMargin.actions"

export function dynamicMargin(state: boolean = setDynamicMargin().payload, action: DynamicMarginAction): boolean {
	switch (action.type) {
		case DynamicMarginActions.SET_DYNAMIC_MARGIN:
			return action.payload
		default:
			return state
	}
}
