import { MarginAction, setMargin } from "./margin.actions"

export function splitMarginAction(payload: number): MarginAction {
	return setMargin(payload)
}
