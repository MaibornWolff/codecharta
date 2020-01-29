import { Action } from "redux"

export enum IsLoadingMapActions {
	SET_IS_LOADING_MAP = "SET_IS_LOADING_MAP"
}

export interface SetIsLoadingMapAction extends Action {
	type: IsLoadingMapActions.SET_IS_LOADING_MAP
	payload: boolean
}

export type IsLoadingMapAction = SetIsLoadingMapAction

export function setIsLoadingMap(isLoadingMap: boolean = defaultIsLoadingMap): SetIsLoadingMapAction {
	return {
		type: IsLoadingMapActions.SET_IS_LOADING_MAP,
		payload: isLoadingMap
	}
}

export const defaultIsLoadingMap: boolean = false
