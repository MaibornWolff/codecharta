import { setMapSize } from "./mapSize.actions"

export function splitMapSizeAction(payload: number) {
	return setMapSize(payload)
}
