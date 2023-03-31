import { createReducer, on } from "@ngrx/store"
import { setScaling } from "./scaling.actions"
import { Scaling } from "../../../../codeCharta.model"

export const scaling = createReducer(
	{ x: 1, y: 1, z: 1 } as Scaling,
	on(setScaling, (state, payload) => ({ ...state, ...payload.value }))
)
