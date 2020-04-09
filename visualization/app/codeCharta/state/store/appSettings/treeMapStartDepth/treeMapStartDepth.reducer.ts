import { TreeMapStartDepthAction, TreeMapStartDepthActions, setTreeMapStartDepth } from "./treeMapStartDepth.actions"

export function treeMapStartDepth(state: number = setTreeMapStartDepth().payload, action: TreeMapStartDepthAction): number {
	switch (action.type) {
		case TreeMapStartDepthActions.SET_TREE_MAP_START_DEPTH:
			return action.payload
		default:
			return state
	}
}
