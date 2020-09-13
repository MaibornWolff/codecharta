import { IsLoadingMapAction, IsLoadingMapActions, setIsLoadingMap } from "./isLoadingMap.actions"

export function isLoadingMap(state: boolean = setIsLoadingMap().payload, action: IsLoadingMapAction) {
	switch (action.type) {
		case IsLoadingMapActions.SET_IS_LOADING_MAP:
			return action.payload
		default:
			return state
	}
}
