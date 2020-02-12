import { EdgesAction, EdgesActions, setEdges } from "./edges.actions"
import { Edge } from "../../../../model/codeCharta.model"
import { addItemToArray, removeItemFromArray } from "../../../../util/reduxHelper"
const clone = require("rfdc")()

export function edges(state: Edge[] = setEdges().payload, action: EdgesAction): Edge[] {
	switch (action.type) {
		case EdgesActions.SET_EDGES:
			return clone(action.payload)
		case EdgesActions.ADD_EDGE:
			return addItemToArray(state, action.payload)
		case EdgesActions.REMOVE_EDGE:
			return removeItemFromArray(state, action.payload)
		default:
			return state
	}
}
