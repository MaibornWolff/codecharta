import { Action } from "redux"

export enum RightClickedNodeDataActions {
	SET_RIGHT_CLICKED_NODE_DATA = "SET_RIGHT_CLICKED_NODE_DATA"
}

export type RightClickedNodeData = {
	nodeId: number
	xPositionOfRightClickEvent: number
	yPositionOfRightClickEvent: number
} | null

export interface SetRightClickedNodeDataAction extends Action {
	type: RightClickedNodeDataActions.SET_RIGHT_CLICKED_NODE_DATA
	payload: RightClickedNodeData
}

export const defaultRightClickedNodeData: RightClickedNodeData = null

export const setRightClickedNodeData = (payload: RightClickedNodeData): SetRightClickedNodeDataAction => ({
	type: RightClickedNodeDataActions.SET_RIGHT_CLICKED_NODE_DATA,
	payload
})
