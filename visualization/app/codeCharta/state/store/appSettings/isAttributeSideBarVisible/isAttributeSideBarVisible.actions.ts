import { Action } from "redux"

export enum IsAttributeSideBarVisibleActions {
	SET_IS_ATTRIBUTE_SIDE_BAR_VISIBLE = "SET_IS_ATTRIBUTE_SIDE_BAR_VISIBLE"
}

export interface SetIsAttributeSideBarVisibleAction extends Action {
	type: IsAttributeSideBarVisibleActions.SET_IS_ATTRIBUTE_SIDE_BAR_VISIBLE
	payload: boolean
}

export type IsAttributeSideBarVisibleAction = SetIsAttributeSideBarVisibleAction

export function setIsAttributeSideBarVisible(
	isAttributeSideBarVisible: boolean = defaultIsAttributeSideBarVisible
): SetIsAttributeSideBarVisibleAction {
	return {
		type: IsAttributeSideBarVisibleActions.SET_IS_ATTRIBUTE_SIDE_BAR_VISIBLE,
		payload: isAttributeSideBarVisible
	}
}

export const defaultIsAttributeSideBarVisible: boolean = false
