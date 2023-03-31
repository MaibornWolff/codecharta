import { createReducer, on } from "@ngrx/store"
import { setColorLabels } from "./colorLabels.actions"
import { ColorLabelOptions } from "../../../../codeCharta.model"

export const colorLabels = createReducer(
	{ positive: false, negative: false, neutral: false } as ColorLabelOptions,
	on(setColorLabels, (state, payload) => ({ ...state, ...payload.value }))
)
