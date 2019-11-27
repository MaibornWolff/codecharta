import { Action } from "redux"

export enum DynamicMarginActions {
	SET_DYNAMIC_MARGIN = "SET_DYNAMIC_MARGIN"
}

export interface SetDynamicMarginAction extends Action {
	type: DynamicMarginActions.SET_DYNAMIC_MARGIN
	payload: boolean
}

export type DynamicMarginAction = SetDynamicMarginAction

export function setDynamicMargin(dynamicMargin: boolean): DynamicMarginAction {
	return {
		type: DynamicMarginActions.SET_DYNAMIC_MARGIN,
		payload: dynamicMargin
	}
}
