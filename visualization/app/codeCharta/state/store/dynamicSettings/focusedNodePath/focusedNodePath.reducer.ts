import { FocusedNodePathAction, FocusedNodePathActions } from "./focusedNodePath.actions"

export function focusedNodePath(state: string = "", action: FocusedNodePathAction): string {
	switch (action.type) {
		case FocusedNodePathActions.SET_FOCUSED_NODE_PATH:
			return action.payload
		default:
			return state
	}
}
