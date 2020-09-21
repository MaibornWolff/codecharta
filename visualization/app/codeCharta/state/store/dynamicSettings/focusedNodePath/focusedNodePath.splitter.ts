import { focusNode, unfocusNode } from "./focusedNodePath.actions"

export function splitFocusedNodePathAction(payload: string) {
	if (payload === "") {
		return unfocusNode()
	}
	return focusNode(payload)
}
