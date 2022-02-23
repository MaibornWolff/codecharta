import { setIdToNode } from "./idToNode.actions"
import { CodeMapNode } from "../../../../codeCharta.model"

export function splitIdToNodeAction(payload: Map<number, CodeMapNode>) {
	return setIdToNode(payload)
}
