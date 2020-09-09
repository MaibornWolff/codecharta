import { FocusedNodePathAction, focusNode, unfocusNode } from "./focusedNodePath.actions"

export function splitFocusedNodePathAction(payload: string): FocusedNodePathAction {
	if (payload === "") {
		return unfocusNode()
	}
	return focusNode(payload)
}
