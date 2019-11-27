import { EdgesAction, EdgesActions } from "./edges.actions"
import { Edge } from "../../../../codeCharta.model"

export function edges(state: Edge[] = [], action: EdgesAction): Edge[] {
	switch (action.type) {
		case EdgesActions.SET_EDGES:
			return action.payload
		case EdgesActions.ADD_EDGE:
			return action.payload
		case EdgesActions.REMOVE_EDGE:
			return action.payload
		default:
			return state
	}
}
