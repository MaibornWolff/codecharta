import { PathToBuildingAction, setPathToBuilding } from "./pathToBuilding.actions"
import { CodeMapBuilding } from "../../../../ui/codeMap/rendering/codeMapBuilding"

export function splitPathToBuildingAction(payload: Map<string, CodeMapBuilding>): PathToBuildingAction {
	return setPathToBuilding(payload)
}
