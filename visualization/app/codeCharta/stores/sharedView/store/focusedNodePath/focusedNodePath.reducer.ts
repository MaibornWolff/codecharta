import { createReducer, on } from "@ngrx/store"
import { fileRoot } from "../../../../util/fileRoot"
import { focusNode, setAllFocusedNodes, unfocusNode } from "./focusedNodePath.actions"

const ONE_FOCUS = 1

/** A list for the saved states and scenarios that carry one; it never holds more than the one focus. */
export const defaultFocusedNodePath: string[] = []
export const focusedNodePath = createReducer(
    defaultFocusedNodePath,
    on(setAllFocusedNodes, (_state, action) => action.value.slice(0, ONE_FOCUS)),
    on(focusNode, (state, action) => (action.value === fileRoot.rootPath ? state : [action.value])),
    on(unfocusNode, () => [])
)
