import { createReducer, on } from "@ngrx/store"
import { setEnableFloorLabels } from "./enableFloorLabels.actions"

export const enableFloorLabels = createReducer(
	true,
	on(setEnableFloorLabels, (_state, payload) => payload.value)
)
