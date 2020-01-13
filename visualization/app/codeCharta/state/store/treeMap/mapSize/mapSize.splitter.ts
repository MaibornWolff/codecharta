import { MapSizeAction, setMapSize } from "./mapSize.actions"

export function splitMapSizeAction(payload: number): MapSizeAction {
	return setMapSize(payload)
}
