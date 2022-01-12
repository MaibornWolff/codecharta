import { CCAction } from "../../../../codeCharta.model"

export enum FocusedNodePathActions {
	FOCUS_NODE = "FOCUS_NODE",
	UNFOCUS_NODE = "UNFOCUS_NODE",
	UNFOCUS_ALL_NODES = "UNFOCUS_ALL_NODES",
	SET_ALL_FOCUSED_NODES = "SET_ALL_FOCUSED_NODES"
}

export interface FocusNodeAction extends CCAction {
	type: FocusedNodePathActions.FOCUS_NODE
	payload: string
}

export interface UnfocusNodeAction extends CCAction {
	type: FocusedNodePathActions.UNFOCUS_NODE
}

export interface UnfocusAllNodesAction extends CCAction {
	type: FocusedNodePathActions.UNFOCUS_ALL_NODES
}
export interface SetAllFocusedNodesAction extends CCAction {
	type: FocusedNodePathActions.SET_ALL_FOCUSED_NODES
	payload: string[]
}

export type FocusedNodePathAction = FocusNodeAction | UnfocusNodeAction | UnfocusAllNodesAction | SetAllFocusedNodesAction

export function focusNode(focusedNodePath: string): FocusNodeAction {
	return {
		type: FocusedNodePathActions.FOCUS_NODE,
		payload: focusedNodePath
	}
}

export function unfocusNode(): UnfocusNodeAction {
	return {
		type: FocusedNodePathActions.UNFOCUS_NODE
	}
}

export function unfocusAllNodes(): UnfocusAllNodesAction {
	return {
		type: FocusedNodePathActions.UNFOCUS_ALL_NODES
	}
}
export function setAllFocusedNodes(focusedNodePaths: string[]): SetAllFocusedNodesAction {
	return {
		type: FocusedNodePathActions.SET_ALL_FOCUSED_NODES,
		payload: focusedNodePaths
	}
}

export const defaultFocusedNodePath: string[] = []
