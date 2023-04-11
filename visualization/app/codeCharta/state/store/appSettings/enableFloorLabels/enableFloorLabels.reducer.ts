import { createReducer, on } from "@ngrx/store"
import { setEnableFloorLabels } from "./enableFloorLabels.actions"

export const defaultEnableFloorLabels = true
export const enableFloorLabels = createReducer(
	defaultEnableFloorLabels,
	on(setEnableFloorLabels, (_state, action) => action.value)
)
