import { Action } from "redux"

export enum InvertHeightActions {
	SET_INVERT_HEIGHT = "SET_INVERT_HEIGHT"
}

export interface SetInvertHeightAction extends Action {
	type: InvertHeightActions.SET_INVERT_HEIGHT
	payload: boolean
}

export type InvertHeightAction = SetInvertHeightAction

export function setInvertHeight(invertHeight: boolean): InvertHeightAction {
	return {
		type: InvertHeightActions.SET_INVERT_HEIGHT,
		payload: invertHeight
	}
}
