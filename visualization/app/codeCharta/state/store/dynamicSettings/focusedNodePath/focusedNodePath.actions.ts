import { Action } from "redux"

export enum FocusedNodePathActions {
	SET_FOCUSED_NODE_PATH = "SET_FOCUSED_NODE_PATH"
}

export interface SetFocusedNodePathAction extends Action {
	type: FocusedNodePathActions.SET_FOCUSED_NODE_PATH
	payload: string
}

export type FocusedNodePathAction = SetFocusedNodePathAction

export function setFocusedNodePath(focusedNodePath: string): FocusedNodePathAction {
	return {
		type: FocusedNodePathActions.SET_FOCUSED_NODE_PATH,
		payload: focusedNodePath
	}
}
