import { EdgesAction, EdgesActions, setEdges } from "./edges.actions"
import { addItemToArray, removeItemFromArray } from "../../../../util/reduxHelper"

export function edges(state = setEdges().payload, action: EdgesAction) {
	switch (action.type) {
		case EdgesActions.SET_EDGES:
			return action.payload
		case EdgesActions.ADD_EDGE:
			return addItemToArray(state, action.payload)
		case EdgesActions.REMOVE_EDGE:
			return removeItemFromArray(state, action.payload)
		default:
			return state
	}
}
