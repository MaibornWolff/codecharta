import { ColorRangeAction, ColorRangeActions, setColorRange } from "./colorRange.actions"
import { ColorRange } from "../../../../model/codeCharta.model"
import _ from "lodash"

export function colorRange(state: ColorRange = setColorRange().payload, action: ColorRangeAction): ColorRange {
	switch (action.type) {
		case ColorRangeActions.SET_COLOR_RANGE:
			return _.cloneDeep(action.payload)
		default:
			return state
	}
}
