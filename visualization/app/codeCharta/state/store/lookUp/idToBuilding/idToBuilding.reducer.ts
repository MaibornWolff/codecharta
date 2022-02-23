import { IdToBuildingAction, IdToBuildingActions, setIdToBuilding } from "./idToBuilding.actions"
import { CodeMapBuilding } from "../../../../ui/codeMap/rendering/codeMapBuilding"

export function idToBuilding(
	state: Map<number, CodeMapBuilding> = setIdToBuilding().payload,
	action: IdToBuildingAction
): Map<number, CodeMapBuilding> {
	switch (action.type) {
		case IdToBuildingActions.SET_ID_TO_BUILDING:
			return new Map(action.payload)
		default:
			return state
	}
}
