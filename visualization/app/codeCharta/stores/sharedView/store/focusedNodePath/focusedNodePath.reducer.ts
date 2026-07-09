import { createReducer, on } from "@ngrx/store"
import { fileRoot } from "../../../../util/fileRoot"
import { focusNode, setAllFocusedNodes, unfocusAllNodes, unfocusNode } from "./focusedNodePath.actions"

export const defaultFocusedNodePath: string[] = []
export const focusedNodePath = createReducer(
    defaultFocusedNodePath,
    on(setAllFocusedNodes, (_state, action) => [...action.value]),
    on(unfocusAllNodes, () => []),
    on(focusNode, (state, action) => (action.value === fileRoot.rootPath ? state : [action.value, ...state])),
    on(unfocusNode, state => state.slice(1))
)
