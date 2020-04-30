import { Action } from "redux"
import { CodeMapNode } from "../../../../codeCharta.model"

export enum IdToNodeActions {
	SET_ID_TO_NODE = "SET_ID_TO_NODE"
}

export interface SetIdToNodeAction extends Action {
	type: IdToNodeActions.SET_ID_TO_NODE
	payload: Map<number, CodeMapNode>
}

export type IdToNodeAction = SetIdToNodeAction

export function setIdToNode(idToNode: Map<number, CodeMapNode> = defaultIdToNode): SetIdToNodeAction {
	return {
		type: IdToNodeActions.SET_ID_TO_NODE,
		payload: idToNode
	}
}

export const defaultIdToNode: Map<number, CodeMapNode> = new Map()
