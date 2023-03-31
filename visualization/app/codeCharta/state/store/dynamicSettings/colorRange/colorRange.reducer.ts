import { createReducer, on } from "@ngrx/store"
import { setColorRange } from "./colorRange.actions"
import { ColorRange } from "../../../../codeCharta.model"

export const colorRange = createReducer(
	// TODO this PR maybe 0, 0 better default?
	{ from: null, to: null } as ColorRange,
	on(setColorRange, (state, payload) => ({ ...state, ...payload.value }))
)
