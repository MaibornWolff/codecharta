import { MapSizeAction, MapSizeActions, setMapSize } from "./mapSize.actions"

export function mapSize(state: number = setMapSize().payload, action: MapSizeAction) {
	switch (action.type) {
		case MapSizeActions.SET_MAP_SIZE:
			return action.payload
		default:
			return state
	}
}
