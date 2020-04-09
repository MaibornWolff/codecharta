import { TreeMapStartDepthAction, setTreeMapStartDepth } from "./treeMapStartDepth.actions"

export function splitTreeMapStartDepthAction(payload: number): TreeMapStartDepthAction {
	return setTreeMapStartDepth(payload)
}
