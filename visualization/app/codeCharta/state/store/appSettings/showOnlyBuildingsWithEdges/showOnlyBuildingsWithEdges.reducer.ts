import { createReducer, on } from "@ngrx/store"
import { setShowOnlyBuildingsWithEdges } from "./showOnlyBuildingsWithEdges.actions"

export const defaultShowOnlyBuildingsWithEdges = false
export const showOnlyBuildingsWithEdges = createReducer(
	defaultShowOnlyBuildingsWithEdges,
	on(setShowOnlyBuildingsWithEdges, (_state, payload) => payload.value)
)
