import { PathToNodeAction, PathToNodeActions, setPathToNode } from "./pathToNode.actions"
import { CodeMapNode } from "../../../../codeCharta.model"

export function pathToNode(state: Map<string, CodeMapNode> = setPathToNode().payload, action: PathToNodeAction): Map<string, CodeMapNode> {
	switch (action.type) {
		case PathToNodeActions.SET_PATH_TO_NODE:
			return new Map(action.payload)
		default:
			return state
	}
}
