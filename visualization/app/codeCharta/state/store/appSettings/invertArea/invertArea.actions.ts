import { CCAction } from "../../../../codeCharta.model"

export enum InvertAreaActions {
	SET_INVERT_AREA = "SET_INVERT_AREA"
}

export interface SetInvertAreaAction extends CCAction {
	type: InvertAreaActions.SET_INVERT_AREA
	payload: boolean
}

export type InvertAreaAction = SetInvertAreaAction

export function setInvertArea(invertArea: boolean = defaultInvertArea): SetInvertAreaAction {
	return {
		type: InvertAreaActions.SET_INVERT_AREA,
		payload: invertArea
	}
}

export const defaultInvertArea = false
