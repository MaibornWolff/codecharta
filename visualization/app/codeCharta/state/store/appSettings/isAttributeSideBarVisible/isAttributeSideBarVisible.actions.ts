import { Action } from "redux"

export enum IsAttributeSideBarVisibleActions {
	SET_IS_ATTRIBUTE_SIDE_BAR_VISIBLE = "SET_IS_ATTRIBUTE_SIDE_BAR_VISIBLE",
	OPEN_ATTRIBUTE_SIDE_BAR = "OPEN_ATTRIBUTE_SIDE_BAR",
	CLOSE_ATTRIBUTE_SIDE_BAR = "CLOSE_ATTRIBUTE_SIDE_BAR"
}

export interface SetIsAttributeSideBarVisibleAction extends Action {
	type: IsAttributeSideBarVisibleActions.SET_IS_ATTRIBUTE_SIDE_BAR_VISIBLE
	payload: boolean
}

export interface OpenAttributeSideBarAction extends Action {
	type: IsAttributeSideBarVisibleActions.OPEN_ATTRIBUTE_SIDE_BAR
}

export interface CloseAttributeSideBarAction extends Action {
	type: IsAttributeSideBarVisibleActions.CLOSE_ATTRIBUTE_SIDE_BAR
}

export type IsAttributeSideBarVisibleAction = SetIsAttributeSideBarVisibleAction | OpenAttributeSideBarAction | CloseAttributeSideBarAction

export function setIsAttributeSideBarVisible(
	isAttributeSideBarVisible: boolean = defaultIsAttributeSideBarVisible
): SetIsAttributeSideBarVisibleAction {
	return {
		type: IsAttributeSideBarVisibleActions.SET_IS_ATTRIBUTE_SIDE_BAR_VISIBLE,
		payload: isAttributeSideBarVisible
	}
}

export function openAttributeSideBar(): OpenAttributeSideBarAction {
	return {
		type: IsAttributeSideBarVisibleActions.OPEN_ATTRIBUTE_SIDE_BAR
	}
}

export function closeAttributeSideBar(): CloseAttributeSideBarAction {
	return {
		type: IsAttributeSideBarVisibleActions.CLOSE_ATTRIBUTE_SIDE_BAR
	}
}

export const defaultIsAttributeSideBarVisible: boolean = false
