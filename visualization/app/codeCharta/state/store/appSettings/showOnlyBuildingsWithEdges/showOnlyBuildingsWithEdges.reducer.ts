import { createReducer, on } from "@ngrx/store"
import { setShowOnlyBuildingsWithEdges } from "./showOnlyBuildingsWithEdges.actions"

export const showOnlyBuildingsWithEdges = createReducer(
	false,
	on(setShowOnlyBuildingsWithEdges, (_state, payload) => payload.value)
)
