import { setInvertColorRange } from "./invertColorRange.actions"

export function splitInvertColorRangeAction(payload: boolean) {
	return setInvertColorRange(payload)
}
