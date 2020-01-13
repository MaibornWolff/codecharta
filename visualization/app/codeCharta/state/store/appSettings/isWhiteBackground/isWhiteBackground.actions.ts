import { CCAction } from "../../../../codeCharta.model"

export enum IsWhiteBackgroundActions {
	SET_IS_WHITE_BACKGROUND = "SET_IS_WHITE_BACKGROUND"
}

export interface SetIsWhiteBackgroundAction extends CCAction {
	type: IsWhiteBackgroundActions.SET_IS_WHITE_BACKGROUND
	payload: boolean
}

export type IsWhiteBackgroundAction = SetIsWhiteBackgroundAction

export function setIsWhiteBackground(isWhiteBackground: boolean = defaultIsWhiteBackground): SetIsWhiteBackgroundAction {
	return {
		type: IsWhiteBackgroundActions.SET_IS_WHITE_BACKGROUND,
		payload: isWhiteBackground
	}
}

export const defaultIsWhiteBackground = false
