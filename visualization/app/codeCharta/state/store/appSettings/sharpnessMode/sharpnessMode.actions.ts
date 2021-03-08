import { CCAction, SharpnessMode } from "../../../../codeCharta.model"

export enum SharpnessModeActions {
	SET_SHARPNESS_MODE = "SET_SHARPNESS_MODE"
}

export interface SetSharpnessModeAction extends CCAction {
	type: SharpnessModeActions.SET_SHARPNESS_MODE
	payload: SharpnessMode
}

export type SharpnessModeAction = SetSharpnessModeAction

export function setSharpnessMode(sharpnessMode: SharpnessMode = defaultSharpnessMode): SetSharpnessModeAction {
	return {
		type: SharpnessModeActions.SET_SHARPNESS_MODE,
		payload: sharpnessMode
	}
}

export const defaultSharpnessMode: SharpnessMode = SharpnessMode.Standard
