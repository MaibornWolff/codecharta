import { focusNode, setAllFocusedNodes, unfocusAllNodes, unfocusNode } from "./focusedNodePath.actions"
import { fileRoot } from "../../../../services/loadFile/fileRoot"
import { createReducer, on } from "@ngrx/store"

export const defaultFocusedNodePath: string[] = []
export const focusedNodePath = createReducer(
	defaultFocusedNodePath,
	on(setAllFocusedNodes, (_state, payload) => [...payload.value]),
	on(unfocusAllNodes, () => []),
	on(focusNode, (state, payload) => (payload.value === fileRoot.rootPath ? state : [payload.value, ...state])),
	on(unfocusNode, state => state.slice(1))
)
