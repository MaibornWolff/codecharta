import { Action } from "redux"

export enum MapSizeActions {
	SET_MAP_SIZE = "SET_MAP_SIZE"
}

export interface SetMapSizeAction extends Action {
	type: MapSizeActions.SET_MAP_SIZE
	payload: number
}

export type MapSizeAction = SetMapSizeAction

export function setMapSize(mapSize: number = defaultMapSize): SetMapSizeAction {
	return {
		type: MapSizeActions.SET_MAP_SIZE,
		payload: mapSize
	}
}

export const defaultMapSize: number = 250
