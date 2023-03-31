import { createReducer, on } from "@ngrx/store"
import { setColorRange } from "./colorRange.actions"
import { ColorRange } from "../../../../codeCharta.model"

export const colorRange = createReducer(
	{ from: null, to: null } as ColorRange,
	on(setColorRange, (state, payload) => ({ ...state, ...payload.value }))
)
