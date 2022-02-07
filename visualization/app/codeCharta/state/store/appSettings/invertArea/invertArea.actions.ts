import { Action } from "redux"

export enum InvertAreaActions {
	SET_INVERT_AREA = "SET_INVERT_AREA",
	TOGGLE_INVERTING_AREA = "TOGGLE_INVERTING_AREA"
}

export interface SetInvertAreaAction extends Action {
	type: InvertAreaActions.SET_INVERT_AREA
	payload: boolean
}

export type InvertAreaAction = SetInvertAreaAction

export const defaultInvertArea = false

export function setInvertArea(invertArea: boolean = defaultInvertArea): SetInvertAreaAction {
	return {
		type: InvertAreaActions.SET_INVERT_AREA,
		payload: invertArea
	}
}

export interface ToggleInvertingAreaAction extends Action {
	type: InvertAreaActions.TOGGLE_INVERTING_AREA
}

export function toggleInvertingArea(): ToggleInvertingAreaAction {
	return {
		type: InvertAreaActions.TOGGLE_INVERTING_AREA
	}
}
