import { RecursivePartial, CCAction, LookUp } from "../../../codeCharta.model"

import { splitIdToBuildingAction } from "./idToBuilding/idToBuilding.splitter"
import { CodeMapBuilding } from "../../../ui/codeMap/rendering/codeMapBuilding"

export function splitLookUpActions(payload: RecursivePartial<LookUp>) {
	const actions: CCAction[] = []

	if (payload.idToBuilding !== undefined) {
		actions.push(splitIdToBuildingAction(payload.idToBuilding as Map<number, CodeMapBuilding>))
	}

	return actions
}
