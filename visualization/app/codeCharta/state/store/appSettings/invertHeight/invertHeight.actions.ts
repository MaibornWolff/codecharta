import { CCAction } from "../../../../model/codeCharta.model"

export enum InvertHeightActions {
	SET_INVERT_HEIGHT = "SET_INVERT_HEIGHT"
}

export interface SetInvertHeightAction extends CCAction {
	type: InvertHeightActions.SET_INVERT_HEIGHT
	payload: boolean
}

export type InvertHeightAction = SetInvertHeightAction

export function setInvertHeight(invertHeight: boolean = defaultInvertHeight): SetInvertHeightAction {
	return {
		type: InvertHeightActions.SET_INVERT_HEIGHT,
		payload: invertHeight
	}
}

export const defaultInvertHeight = false
