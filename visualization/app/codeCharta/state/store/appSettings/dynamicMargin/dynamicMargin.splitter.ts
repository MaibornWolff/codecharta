import { DynamicMarginAction, setDynamicMargin } from "./dynamicMargin.actions"

export function splitDynamicMarginAction(payload: boolean): DynamicMarginAction {
	return setDynamicMargin(payload)
}
