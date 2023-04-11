import { createReducer, on } from "@ngrx/store"
import { setHideFlatBuildings } from "./hideFlatBuildings.actions"

export const defaultHideFlatBuildings = false
export const hideFlatBuildings = createReducer(
	defaultHideFlatBuildings,
	on(setHideFlatBuildings, (_state, action) => action.value)
)
