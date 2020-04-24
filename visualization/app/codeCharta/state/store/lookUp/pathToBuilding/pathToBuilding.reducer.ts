import { PathToBuildingAction, PathToBuildingActions, setPathToBuilding } from "./pathToBuilding.actions"
import { CodeMapBuilding } from "../../../../ui/codeMap/rendering/codeMapBuilding"

export function pathToBuilding(
	state: Map<number, CodeMapBuilding> = setPathToBuilding().payload,
	action: PathToBuildingAction
): Map<number, CodeMapBuilding> {
	switch (action.type) {
		case PathToBuildingActions.SET_PATH_TO_BUILDING:
			return new Map(action.payload)
		default:
			return state
	}
}
