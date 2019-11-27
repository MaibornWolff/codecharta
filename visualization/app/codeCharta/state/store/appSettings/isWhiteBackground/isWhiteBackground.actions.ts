import { Action } from "redux"

export enum IsWhiteBackgroundActions {
	SET_IS_WHITE_BACKGROUND = "SET_IS_WHITE_BACKGROUND"
}

export interface SetIsWhiteBackgroundAction extends Action {
	type: IsWhiteBackgroundActions.SET_IS_WHITE_BACKGROUND
	payload: boolean
}

export type IsWhiteBackgroundAction = SetIsWhiteBackgroundAction

export function setIsWhiteBackground(isWhiteBackground: boolean): IsWhiteBackgroundAction {
	return {
		type: IsWhiteBackgroundActions.SET_IS_WHITE_BACKGROUND,
		payload: isWhiteBackground
	}
}
