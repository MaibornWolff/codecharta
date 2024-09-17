import { focusNode, setAllFocusedNodes, unfocusAllNodes, unfocusNode } from "./focusedNodePath.actions"
import { fileRoot } from "../../../../services/loadFile/fileRoot"
import { createReducer, on } from "@ngrx/store"
import { isChildPath } from "../../../../util/isChildPath"

export const defaultFocusedNodePath: string[] = []
export const focusedNodePath = createReducer(
    defaultFocusedNodePath,
    on(setAllFocusedNodes, (_state, action) => [...action.value]),
    on(unfocusAllNodes, () => []),
    on(focusNode, (state, action) => {
        if (action.value === fileRoot.rootPath) {
            return state
        }
        if (isChildPath(action.value, state[0])) {
            return [action.value, ...state]
        }
        return [action.value]
    }),
    on(unfocusNode, state => state.slice(1))
)
