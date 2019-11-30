import { Action } from "redux"

export enum InvertDeltaColorsActions {
	SET_INVERT_DELTA_COLORS = "SET_INVERT_DELTA_COLORS"
}

export interface SetInvertDeltaColorsAction extends Action {
	type: InvertDeltaColorsActions.SET_INVERT_DELTA_COLORS
	payload: boolean
}

export type InvertDeltaColorsAction = SetInvertDeltaColorsAction

export function setInvertDeltaColors(invertDeltaColors: boolean): InvertDeltaColorsAction {
	return {
		type: InvertDeltaColorsActions.SET_INVERT_DELTA_COLORS,
		payload: invertDeltaColors
	}
}
