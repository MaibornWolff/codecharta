import { PathToNodeAction, setPathToNode } from "./pathToNode.actions"
import { CodeMapNode } from "../../../../codeCharta.model"

export function splitPathToNodeAction(payload: Map<number, CodeMapNode>): PathToNodeAction {
	return setPathToNode(payload)
}
