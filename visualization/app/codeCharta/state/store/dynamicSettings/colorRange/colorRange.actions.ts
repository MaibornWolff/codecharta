import { CCAction, ColorRange } from "../../../../codeCharta.model"

export enum ColorRangeActions {
	SET_COLOR_RANGE = "SET_COLOR_RANGE"
}

export interface SetColorRangeAction extends CCAction {
	type: ColorRangeActions.SET_COLOR_RANGE
	payload: ColorRange
}

export type ColorRangeAction = SetColorRangeAction

export function setColorRange(colorRange: ColorRange = { from: null, to: null }): SetColorRangeAction {
	return {
		type: ColorRangeActions.SET_COLOR_RANGE,
		payload: colorRange
	}
}
