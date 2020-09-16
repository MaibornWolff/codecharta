import { setIsLoadingMap } from "./isLoadingMap.actions"

export function splitIsLoadingMapAction(payload: boolean) {
	return setIsLoadingMap(payload)
}
