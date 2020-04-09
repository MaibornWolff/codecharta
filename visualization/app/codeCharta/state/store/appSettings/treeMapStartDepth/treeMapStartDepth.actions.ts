import { Action } from "redux"

export enum TreeMapStartDepthActions {
	SET_TREE_MAP_START_DEPTH = "SET_TREE_MAP_START_DEPTH"
}

export interface SetTreeMapStartDepthAction extends Action {
	type: TreeMapStartDepthActions.SET_TREE_MAP_START_DEPTH
	payload: number
}

export type TreeMapStartDepthAction = SetTreeMapStartDepthAction

export function setTreeMapStartDepth(treeMapStartDepth: number = defaultTreeMapStartDepth): SetTreeMapStartDepthAction {
	return {
		type: TreeMapStartDepthActions.SET_TREE_MAP_START_DEPTH,
		payload: treeMapStartDepth
	}
}

export const defaultTreeMapStartDepth: number = 0
