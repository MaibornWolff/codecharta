import { FocusedNodePathAction, FocusedNodePathActions, focusNode } from "./focusedNodePath.actions"

export function focusedNodePath(state: string = focusNode().payload, action: FocusedNodePathAction): string {
	switch (action.type) {
		case FocusedNodePathActions.FOCUS_NODE:
			return action.payload
		case FocusedNodePathActions.UNFOCUS_NODE:
			return action.payload
		default:
			return state
	}
}
