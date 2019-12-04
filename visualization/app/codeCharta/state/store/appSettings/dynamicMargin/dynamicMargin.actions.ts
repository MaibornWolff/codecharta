import { CCAction } from "../../../../codeCharta.model"

export enum DynamicMarginActions {
	SET_DYNAMIC_MARGIN = "SET_DYNAMIC_MARGIN"
}

export interface SetDynamicMarginAction extends CCAction {
	type: DynamicMarginActions.SET_DYNAMIC_MARGIN
	payload: boolean
}

export type DynamicMarginAction = SetDynamicMarginAction

export function setDynamicMargin(dynamicMargin: boolean = true): DynamicMarginAction {
	return {
		type: DynamicMarginActions.SET_DYNAMIC_MARGIN,
		payload: dynamicMargin
	}
}
