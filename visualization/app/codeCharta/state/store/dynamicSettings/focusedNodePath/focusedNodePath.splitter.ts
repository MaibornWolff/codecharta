import { FocusedNodePathAction, focusNode, unfocusNode } from "./focusedNodePath.actions"

export function splitFocusedNodePathAction(payload: string): FocusedNodePathAction {
	if (payload === "") {
		return unfocusNode()
	} else {
		return focusNode(payload)
	}
}
