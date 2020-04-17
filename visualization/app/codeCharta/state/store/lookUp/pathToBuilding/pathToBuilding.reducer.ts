import { PathToBuildingAction, PathToBuildingActions, setPathToBuilding } from "./pathToBuilding.actions"
import { CodeMapBuilding } from "../../../../ui/codeMap/rendering/codeMapBuilding"

export function pathToBuilding(
	state: Map<string, CodeMapBuilding> = setPathToBuilding().payload,
	action: PathToBuildingAction
): Map<string, CodeMapBuilding> {
	switch (action.type) {
		case PathToBuildingActions.SET_PATH_TO_BUILDING:
			return new Map(action.payload)
		default:
			return state
	}
}
