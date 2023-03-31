import { createReducer, on } from "@ngrx/store"
import { State } from "../../../../codeCharta.model"
import { setRightClickedNodeData } from "./rightClickedNodeData.actions"

export const defaultRightClickedNodeData: State["appStatus"]["rightClickedNodeData"] = null
export const rightClickedNodeData = createReducer(
	defaultRightClickedNodeData,
	on(setRightClickedNodeData, (_state, payload) => payload.value)
)
