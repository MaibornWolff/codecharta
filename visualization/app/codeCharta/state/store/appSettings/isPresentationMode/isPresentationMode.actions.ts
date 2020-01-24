import { CCAction } from "../../../../model/codeCharta.model"

export enum PresentationModeActions {
	SET_PRESENTATION_MODE = "SET_PRESENTATION_MODE"
}

export interface SetPresentationModeAction extends CCAction {
	type: PresentationModeActions.SET_PRESENTATION_MODE
	payload: boolean
}

export type PresentationModeAction = SetPresentationModeAction

export function setPresentationMode(active: boolean = defaultIsPresentationMode): SetPresentationModeAction {
	return {
		type: PresentationModeActions.SET_PRESENTATION_MODE,
		payload: active
	}
}

export const defaultIsPresentationMode = false
