import { setMargin } from "./margin.actions"

export function splitMarginAction(payload: number) {
	return setMargin(payload)
}
