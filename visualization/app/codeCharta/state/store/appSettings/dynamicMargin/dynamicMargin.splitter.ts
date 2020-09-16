import { setDynamicMargin } from "./dynamicMargin.actions"

export function splitDynamicMarginAction(payload: boolean) {
	return setDynamicMargin(payload)
}
