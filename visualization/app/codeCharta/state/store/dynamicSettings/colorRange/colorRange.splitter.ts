import { setColorRange } from "./colorRange.actions"
import { ColorRange } from "../../../../codeCharta.model"

export function splitColorRangeAction(payload: ColorRange) {
	return setColorRange(payload)
}
