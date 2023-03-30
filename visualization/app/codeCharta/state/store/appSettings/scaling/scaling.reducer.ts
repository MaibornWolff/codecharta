import { createReducer, on } from "@ngrx/store"
import { setScaling } from "./scaling.actions"

export const scaling = createReducer(
	{ x: 1, y: 1, z: 1 },
	on(setScaling, (state, payload) => ({ ...state, ...payload.value }))
)
