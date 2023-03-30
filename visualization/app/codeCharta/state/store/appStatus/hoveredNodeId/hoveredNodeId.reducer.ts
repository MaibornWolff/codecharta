import { createReducer, on } from "@ngrx/store"
import { State } from "../../../../codeCharta.model"
import { setHoveredNodeId } from "./hoveredNodeId.actions"

const initialState: State["appStatus"]["hoveredNodeId"] = null

export const hoveredNodeId = createReducer(
	initialState,
	on(setHoveredNodeId, (_state, payload) => payload.value)
)
