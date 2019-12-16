import { CCAction } from "../../../../codeCharta.model"

export enum FocusedNodePathActions {
	FOCUS_NODE = "FOCUS_NODE",
	UNFOCUS_NODE = "UNFOCUS_NODE"
}

export interface FocusNodeAction extends CCAction {
	type: FocusedNodePathActions.FOCUS_NODE
	payload: string
}

export interface UnfocusNodeAction extends CCAction {
	type: FocusedNodePathActions.UNFOCUS_NODE
	payload: string
}

export type FocusedNodePathAction = FocusNodeAction | UnfocusNodeAction

export function focusNode(focusedNodePath: string = defaultFocusedNodePath): FocusNodeAction {
	return {
		type: FocusedNodePathActions.FOCUS_NODE,
		payload: focusedNodePath
	}
}

export function unfocusNode(): UnfocusNodeAction {
	return {
		type: FocusedNodePathActions.UNFOCUS_NODE,
		payload: ""
	}
}

export const defaultFocusedNodePath = ""
