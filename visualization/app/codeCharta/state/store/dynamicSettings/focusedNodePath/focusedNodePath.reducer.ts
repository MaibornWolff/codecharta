import { FocusedNodePathAction, FocusedNodePathActions } from "./focusedNodePath.actions"

export function focusedNodePath(state: string = "", action: FocusedNodePathAction): string {
	switch (action.type) {
		case FocusedNodePathActions.FOCUS_NODE:
			return action.payload
		case FocusedNodePathActions.UNFOCUS_NODE:
			return action.payload
		default:
			return state
	}
}
