import { CCAction } from "../../../../codeCharta.model"

export enum InvertColorRangeActions {
	SET_INVERT_COLOR_RANGE = "SET_INVERT_COLOR_RANGE"
}

export interface SetInvertColorRangeAction extends CCAction {
	type: InvertColorRangeActions.SET_INVERT_COLOR_RANGE
	payload: boolean
}

export type InvertColorRangeAction = SetInvertColorRangeAction

export function setInvertColorRange(invertColorRange: boolean = false): InvertColorRangeAction {
	return {
		type: InvertColorRangeActions.SET_INVERT_COLOR_RANGE,
		payload: invertColorRange
	}
}
