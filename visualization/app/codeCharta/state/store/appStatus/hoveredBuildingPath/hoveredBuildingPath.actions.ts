import { Action } from "redux"

export enum HoveredBuildingPathActions {
	SET_HOVERED_BUILDING_PATH = "SET_HOVERED_BUILDING_PATH"
}

export type SetHoveredBuildingPathPayload = SetHoveredBuildingPathAction["payload"]

export interface SetHoveredBuildingPathAction extends Action {
	type: HoveredBuildingPathActions.SET_HOVERED_BUILDING_PATH
	payload: string | null
}

export const defaultHoveredBuildingPath: SetHoveredBuildingPathPayload = null

export const setHoveredBuildingPath = (
	hoveredBuildingPath: SetHoveredBuildingPathPayload = defaultHoveredBuildingPath
): SetHoveredBuildingPathAction => ({
	type: HoveredBuildingPathActions.SET_HOVERED_BUILDING_PATH,
	payload: hoveredBuildingPath
})
