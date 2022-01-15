import {
	defaultRightClickedNodeData,
	RightClickedNodeData,
	RightClickedNodeDataActions,
	SetRightClickedNodeDataAction
} from "./rightClickedNodeData.actions"

export const rightClickedNodeData = (state: RightClickedNodeData = defaultRightClickedNodeData, action: SetRightClickedNodeDataAction) => {
	switch (action.type) {
		case RightClickedNodeDataActions.SET_RIGHT_CLICKED_NODE_DATA:
			return action.payload
		default:
			return state
	}
}
