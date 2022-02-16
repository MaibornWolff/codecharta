import { defaultFocusedNodePath, FocusedNodePathAction, FocusedNodePathActions } from "./focusedNodePath.actions"
import { CodeChartaService } from "../../../../codeCharta.service"

export function focusedNodePath(state = defaultFocusedNodePath, action: FocusedNodePathAction) {
	switch (action.type) {
		case FocusedNodePathActions.FOCUS_NODE: {
			if (action.payload === CodeChartaService.ROOT_PATH) return state
			return [action.payload, ...state]
		}
		case FocusedNodePathActions.UNFOCUS_NODE:
			return state.slice(1)
		case FocusedNodePathActions.UNFOCUS_ALL_NODES:
			return []
		case FocusedNodePathActions.SET_ALL_FOCUSED_NODES:
			return [...action.payload]
		default:
			return state
	}
}
