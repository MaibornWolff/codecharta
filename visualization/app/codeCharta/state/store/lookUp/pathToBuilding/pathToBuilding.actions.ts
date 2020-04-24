import { Action } from "redux"
import { CodeMapBuilding } from "../../../../ui/codeMap/rendering/codeMapBuilding"

export enum PathToBuildingActions {
	SET_PATH_TO_BUILDING = "SET_PATH_TO_BUILDING"
}

export interface SetPathToBuildingAction extends Action {
	type: PathToBuildingActions.SET_PATH_TO_BUILDING
	payload: Map<number, CodeMapBuilding>
}

export type PathToBuildingAction = SetPathToBuildingAction

export function setPathToBuilding(pathToBuilding: Map<number, CodeMapBuilding> = defaultPathToBuilding): SetPathToBuildingAction {
	return {
		type: PathToBuildingActions.SET_PATH_TO_BUILDING,
		payload: pathToBuilding
	}
}

export const defaultPathToBuilding: Map<number, CodeMapBuilding> = new Map()
