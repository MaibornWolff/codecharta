import { EdgesAction, EdgesActions, setEdges } from "./edges.actions"
import { Edge } from "../../../../codeCharta.model"
import { addItemToArray, removeItemFromArray } from "../../../../util/reduxHelper"
import _ from "lodash"

export function edges(state: Edge[] = setEdges().payload, action: EdgesAction): Edge[] {
	switch (action.type) {
		case EdgesActions.SET_EDGES:
			return [...action.payload]
		case EdgesActions.ADD_EDGE:
			return addItemToArray(state, action.payload)
		case EdgesActions.REMOVE_EDGE:
			return removeItemFromArray(state, action.payload)
		default:
			return state
	}
}
