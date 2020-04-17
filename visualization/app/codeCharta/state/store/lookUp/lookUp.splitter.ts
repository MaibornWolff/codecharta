import { RecursivePartial, CCAction, LookUp, CodeMapNode } from "../../../codeCharta.model"

// Plop: Append action splitter import here
import { splitPathToBuildingAction } from "./pathToBuilding/pathToBuilding.splitter"
import { splitPathToNodeAction } from "./pathToNode/pathToNode.splitter"
import { CodeMapBuilding } from "../../../ui/codeMap/rendering/codeMapBuilding"

export function splitLookUpActions(payload: RecursivePartial<LookUp>): CCAction[] {
	const actions: CCAction[] = []

	// Plop: Append action split here
	if (payload.pathToBuilding !== undefined) {
		actions.push(splitPathToBuildingAction(payload.pathToBuilding as Map<string, CodeMapBuilding>))
	}

	if (payload.pathToNode !== undefined) {
		actions.push(splitPathToNodeAction(payload.pathToNode as Map<string, CodeMapNode>))
	}

	return actions
}
