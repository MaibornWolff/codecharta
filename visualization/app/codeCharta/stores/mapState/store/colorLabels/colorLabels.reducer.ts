import { createReducer, on } from "@ngrx/store"
import { ColorLabelOptions } from "../../../../model/codeCharta.model"
import { mergeState } from "../../../../util/setState.reducer.factory"
import { setColorLabels } from "./colorLabels.actions"

export const defaultColorLabelOptions: ColorLabelOptions = { positive: false, negative: false, neutral: false }
export const colorLabels = createReducer(defaultColorLabelOptions, on(setColorLabels, mergeState(defaultColorLabelOptions)))
