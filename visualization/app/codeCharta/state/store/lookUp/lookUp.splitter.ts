import { RecursivePartial, CCAction, LookUp, CodeMapNode } from "../../../codeCharta.model"

// Plop: Append action splitter import here
import { splitIdToNodeAction } from "./idToNode/idToNode.splitter"
import { splitIdToBuildingAction } from "./idToBuilding/idToBuilding.splitter"
import { CodeMapBuilding } from "../../../ui/codeMap/rendering/codeMapBuilding"

export function splitLookUpActions(payload: RecursivePartial<LookUp>): CCAction[] {
	const actions: CCAction[] = []

	// Plop: Append action split here
	if (payload.idToNode !== undefined) {
		actions.push(splitIdToNodeAction(payload.idToNode as Map<number, CodeMapNode>))
	}

	if (payload.idToBuilding !== undefined) {
		actions.push(splitIdToBuildingAction(payload.idToBuilding as Map<number, CodeMapBuilding>))
	}

	return actions
}
