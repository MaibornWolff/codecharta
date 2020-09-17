import { setInvertDeltaColors } from "./invertDeltaColors.actions"

export function splitInvertDeltaColorsAction(payload: boolean) {
	return setInvertDeltaColors(payload)
}
