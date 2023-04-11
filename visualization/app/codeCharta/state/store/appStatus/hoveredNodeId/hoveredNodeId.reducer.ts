import { createReducer, on } from "@ngrx/store"
import { State } from "../../../../codeCharta.model"
import { setHoveredNodeId } from "./hoveredNodeId.actions"

export const defaultHoveredNodeId: State["appStatus"]["hoveredNodeId"] = null
export const hoveredNodeId = createReducer(
	defaultHoveredNodeId,
	on(setHoveredNodeId, (_state, action) => action.value)
)
