import { createReducer, on } from "@ngrx/store"
import { setColorLabels } from "./colorLabels.actions"
import { ColorLabelOptions } from "../../../../codeCharta.model"

export const defaultColorLabels: ColorLabelOptions = { positive: false, negative: false, neutral: false }
export const colorLabels = createReducer(
	defaultColorLabels,
	on(setColorLabels, (state, action) => ({ ...state, ...action.value }))
)
