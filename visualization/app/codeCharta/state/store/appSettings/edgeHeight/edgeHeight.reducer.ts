import { EdgeHeightAction, EdgeHeightActions, setEdgeHeight } from "./edgeHeight.actions"

export function edgeHeight(state = setEdgeHeight().payload, action: EdgeHeightAction) {
	switch (action.type) {
		case EdgeHeightActions.SET_EDGE_HEIGHT:
			return action.payload
		default:
			return state
	}
}
