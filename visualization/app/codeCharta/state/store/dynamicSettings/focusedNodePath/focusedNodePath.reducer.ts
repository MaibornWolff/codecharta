import { FocusedNodePathAction, FocusedNodePathActions, focusNode } from "./focusedNodePath.actions"
import { CodeChartaService } from "../../../../codeCharta.service"

export function focusedNodePath(state: string = focusNode().payload, action: FocusedNodePathAction) {
	switch (action.type) {
		case FocusedNodePathActions.FOCUS_NODE:
			return action.payload === CodeChartaService.ROOT_PATH ? state : action.payload
		case FocusedNodePathActions.UNFOCUS_NODE:
			return action.payload
		default:
			return state
	}
}
