import { CCAction } from "../../../../codeCharta.model"

export enum InvertHeightActions {
	SET_INVERT_HEIGHT = "SET_INVERT_HEIGHT"
}

export interface SetInvertHeightAction extends CCAction {
	type: InvertHeightActions.SET_INVERT_HEIGHT
	payload: boolean
}

export type InvertHeightAction = SetInvertHeightAction

export function setInvertHeight(invertHeight: boolean = false): SetInvertHeightAction {
	return {
		type: InvertHeightActions.SET_INVERT_HEIGHT,
		payload: invertHeight
	}
}
