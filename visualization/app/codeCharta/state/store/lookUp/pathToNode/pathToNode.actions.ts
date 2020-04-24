import { Action } from "redux"
import { CodeMapNode } from "../../../../codeCharta.model"

export enum PathToNodeActions {
	SET_PATH_TO_NODE = "SET_PATH_TO_NODE"
}

export interface SetPathToNodeAction extends Action {
	type: PathToNodeActions.SET_PATH_TO_NODE
	payload: Map<number, CodeMapNode>
}

export type PathToNodeAction = SetPathToNodeAction

export function setPathToNode(pathToNode: Map<number, CodeMapNode> = defaultPathToNode): SetPathToNodeAction {
	return {
		type: PathToNodeActions.SET_PATH_TO_NODE,
		payload: pathToNode
	}
}

export const defaultPathToNode: Map<number, CodeMapNode> = new Map()
