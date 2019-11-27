import { Action } from "redux"

export enum InvertColorRangeActions {
	SET_INVERT_COLOR_RANGE = "SET_INVERT_COLOR_RANGE"
}

export interface SetInvertColorRangeAction extends Action {
	type: InvertColorRangeActions.SET_INVERT_COLOR_RANGE
	payload: boolean
}

export type InvertColorRangeAction = SetInvertColorRangeAction

export function setInvertColorRange(invertColorRange: boolean): InvertColorRangeAction {
	return {
		type: InvertColorRangeActions.SET_INVERT_COLOR_RANGE,
		payload: invertColorRange
	}
}
