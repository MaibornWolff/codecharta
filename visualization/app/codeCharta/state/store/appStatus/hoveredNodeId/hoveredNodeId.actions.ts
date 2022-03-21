import { Action } from "redux"

export enum HoveredNodeIdActions {
	SET_HOVERED_NODE_ID = "SET_HOVERED_NODE_ID"
}

export interface SetHoveredNodeIdAction extends Action {
	type: HoveredNodeIdActions.SET_HOVERED_NODE_ID
	payload: number | null
}

export type SetHoveredNodeIdPayload = SetHoveredNodeIdAction["payload"]

export const defaultHoveredNodeId: SetHoveredNodeIdPayload = null

export const setHoveredNodeId = (hoveredNodeId: SetHoveredNodeIdPayload = defaultHoveredNodeId): SetHoveredNodeIdAction => ({
	type: HoveredNodeIdActions.SET_HOVERED_NODE_ID,
	payload: hoveredNodeId
})
