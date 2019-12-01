import { CCAction } from "../../../../codeCharta.model"

export enum MarginActions {
	SET_MARGIN = "SET_MARGIN"
}

export interface SetMarginAction extends CCAction {
	type: MarginActions.SET_MARGIN
	payload: number
}

export type MarginAction = SetMarginAction

export function setMargin(margin: number): MarginAction {
	return {
		type: MarginActions.SET_MARGIN,
		payload: margin
	}
}
