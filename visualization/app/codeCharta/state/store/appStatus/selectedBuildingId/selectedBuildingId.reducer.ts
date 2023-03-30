import { createReducer, on } from "@ngrx/store"
import { State } from "../../../../codeCharta.model"
import { setSelectedBuildingId } from "./selectedBuildingId.actions"

const initialState: State["appStatus"]["selectedBuildingId"] = null

export const selectedBuildingId = createReducer(
	initialState,
	on(setSelectedBuildingId, (_state, payload) => payload.value)
)
