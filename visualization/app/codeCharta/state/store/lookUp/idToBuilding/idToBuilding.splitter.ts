import { setIdToBuilding } from "./idToBuilding.actions"
import { CodeMapBuilding } from "../../../../ui/codeMap/rendering/codeMapBuilding"

export function splitIdToBuildingAction(payload: Map<number, CodeMapBuilding>) {
	return setIdToBuilding(payload)
}
