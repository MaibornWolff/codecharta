import { SetHoveredNodeIdPayload, defaultHoveredNodeId, HoveredNodeIdActions, SetHoveredNodeIdAction } from "./hoveredNodeId.actions"

export const hoveredNodeId = (state: SetHoveredNodeIdPayload = defaultHoveredNodeId, action: SetHoveredNodeIdAction) => {
	switch (action.type) {
		case HoveredNodeIdActions.SET_HOVERED_NODE_ID:
			return action.payload
		default:
			return state
	}
}
