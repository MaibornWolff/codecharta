import { CCAction, RecursivePartial, LookUp } from "../../../codeCharta.model"

// Plop: Append default property import here
import { defaultIdToNode } from "./idToNode/idToNode.actions"
import { defaultIdToBuilding } from "./idToBuilding/idToBuilding.actions"

export enum LookUpActions {
	SET_LOOK_UP = "SET_LOOK_UP"
}

export interface SetLookUpAction extends CCAction {
	type: LookUpActions.SET_LOOK_UP
	payload: RecursivePartial<LookUp>
}

export type LookUpAction = SetLookUpAction

export function setLookUp(lookUp: RecursivePartial<LookUp> = defaultLookUp): LookUpAction {
	return {
		type: LookUpActions.SET_LOOK_UP,
		payload: lookUp
	}
}

export const defaultLookUp: LookUp = {
	// Plop: Append default property here
	idToNode: defaultIdToNode,
	idToBuilding: defaultIdToBuilding
}
