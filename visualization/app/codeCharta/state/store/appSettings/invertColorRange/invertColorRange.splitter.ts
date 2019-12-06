import { InvertColorRangeAction, setInvertColorRange } from "./invertColorRange.actions"

export function splitInvertColorRangeAction(payload: boolean): InvertColorRangeAction {
	return setInvertColorRange(payload)
}
