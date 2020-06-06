import { Action } from "redux"
import { CodeMapBuilding } from "../../../../ui/codeMap/rendering/codeMapBuilding"

export enum IdToBuildingActions {
	SET_ID_TO_BUILDING = "SET_ID_TO_BUILDING"
}

export interface SetIdToBuildingAction extends Action {
	type: IdToBuildingActions.SET_ID_TO_BUILDING
	payload: Map<number, CodeMapBuilding>
}

export type IdToBuildingAction = SetIdToBuildingAction

export function setIdToBuilding(
	idToBuilding: Map<number, CodeMapBuilding> = defaultIdToBuilding
): SetIdToBuildingAction {
	return {
		type: IdToBuildingActions.SET_ID_TO_BUILDING,
		payload: idToBuilding
	}
}

export const defaultIdToBuilding: Map<number, CodeMapBuilding> = new Map()
