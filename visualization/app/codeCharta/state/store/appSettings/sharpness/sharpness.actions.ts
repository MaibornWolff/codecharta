import { CCAction, SharpnessMode } from "../../../../codeCharta.model"

export enum SharpnessActions {
	SET_SHARPNESS_MODE = "SET_SHARPNESS_MODE"
}

export interface SetSharpnessAction extends CCAction {
	type: SharpnessActions.SET_SHARPNESS_MODE
	payload: SharpnessMode
}

export type SharpnessAction = SetSharpnessAction

export function setSharpnessMode(sharpnessMode: SharpnessMode = defaultSharpnessMode): SetSharpnessAction {
	return {
		type: SharpnessActions.SET_SHARPNESS_MODE,
		payload: sharpnessMode
	}
}

export const defaultSharpnessMode: SharpnessMode = SharpnessMode.Standard
