import { createReducer, on } from "@ngrx/store"
import { setHideFlatBuildings } from "./hideFlatBuildings.actions"

export const hideFlatBuildings = createReducer(
	false,
	on(setHideFlatBuildings, (_state, payload) => payload.value)
)
