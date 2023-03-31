import { createReducer, on } from "@ngrx/store"
import { State } from "../../../../codeCharta.model"
import { setSelectedBuildingId } from "./selectedBuildingId.actions"

export const defaultSelectedBuildingId: State["appStatus"]["selectedBuildingId"] = null
export const selectedBuildingId = createReducer(
	defaultSelectedBuildingId,
	on(setSelectedBuildingId, (_state, payload) => payload.value)
)
