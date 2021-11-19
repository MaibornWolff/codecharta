import { RecursivePartial, CCAction, LookUp, CodeMapNode } from "../../../codeCharta.model"

import { splitIdToNodeAction } from "./idToNode/idToNode.splitter"
import { splitIdToBuildingAction } from "./idToBuilding/idToBuilding.splitter"
import { CodeMapBuilding } from "../../../ui/codeMap/rendering/codeMapBuilding"

export function splitLookUpActions(payload: RecursivePartial<LookUp>) {
	const actions: CCAction[] = []

	if (payload.idToNode !== undefined) {
		actions.push(splitIdToNodeAction(payload.idToNode as Map<number, CodeMapNode>))
	}

	if (payload.idToBuilding !== undefined) {
		actions.push(splitIdToBuildingAction(payload.idToBuilding as Map<number, CodeMapBuilding>))
	}

	return actions
}
