import { DynamicMarginAction, DynamicMarginActions, setDynamicMargin } from "./dynamicMargin.actions"

export function dynamicMargin(state = setDynamicMargin().payload, action: DynamicMarginAction) {
	switch (action.type) {
		case DynamicMarginActions.SET_DYNAMIC_MARGIN:
			return action.payload
		default:
			return state
	}
}
