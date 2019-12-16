import { InvertDeltaColorsAction, setInvertDeltaColors } from "./invertDeltaColors.actions"

export function splitInvertDeltaColorsAction(payload: boolean): InvertDeltaColorsAction {
	return setInvertDeltaColors(payload)
}
