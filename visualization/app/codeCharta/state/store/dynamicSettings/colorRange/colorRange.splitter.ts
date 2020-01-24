import { ColorRangeAction, setColorRange } from "./colorRange.actions"
import { ColorRange } from "../../../../model/codeCharta.model"

export function splitColorRangeAction(payload: ColorRange): ColorRangeAction {
	return setColorRange(payload)
}
