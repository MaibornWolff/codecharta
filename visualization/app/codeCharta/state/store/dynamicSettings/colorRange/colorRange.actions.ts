import { Action } from "redux"
import { ColorRange } from "../../../../codeCharta.model"

export enum ColorRangeActions {
	SET_COLOR_RANGE = "SET_COLOR_RANGE"
}

export interface SetColorRangeAction extends Action {
	type: ColorRangeActions.SET_COLOR_RANGE
	payload: ColorRange
}

export type ColorRangeAction = SetColorRangeAction

export function setColorRange(colorRange: ColorRange): ColorRangeAction {
	return {
		type: ColorRangeActions.SET_COLOR_RANGE,
		payload: colorRange
	}
}
