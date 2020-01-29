import { IsLoadingMapAction, setIsLoadingMap } from "./isLoadingMap.actions"

export function splitIsLoadingMapAction(payload: boolean): IsLoadingMapAction {
	return setIsLoadingMap(payload)
}
