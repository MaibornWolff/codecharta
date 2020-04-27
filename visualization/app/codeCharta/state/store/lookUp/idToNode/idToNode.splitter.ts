import { IdToNodeAction, setIdToNode } from "./idToNode.actions"
import { CodeMapNode } from "../../../../codeCharta.model"

export function splitIdToNodeAction(payload: Map<number, CodeMapNode>): IdToNodeAction {
	return setIdToNode(payload)
}
