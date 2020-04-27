import { IdToNodeAction, IdToNodeActions, setIdToNode } from "./idToNode.actions"
import { CodeMapNode } from "../../../../codeCharta.model"

export function idToNode(state: Map<number, CodeMapNode> = setIdToNode().payload, action: IdToNodeAction): Map<number, CodeMapNode> {
	switch (action.type) {
		case IdToNodeActions.SET_ID_TO_NODE:
			return new Map(action.payload)
		default:
			return state
	}
}
