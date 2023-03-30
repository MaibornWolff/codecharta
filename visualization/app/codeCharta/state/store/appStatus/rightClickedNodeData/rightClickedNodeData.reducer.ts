import { createReducer, on } from "@ngrx/store"
import { State } from "../../../../codeCharta.model"
import { setRightClickedNodeData } from "./rightClickedNodeData.actions"

export const initialState: State["appStatus"]["rightClickedNodeData"] = null

export const rightClickedNodeData = createReducer(
	initialState,
	on(setRightClickedNodeData, (_state, payload) => payload.value)
)
