import { createReducer, on } from "@ngrx/store"
import { setColorLabels } from "./colorLabels.actions"
import { ColorLabelOptions } from "../../../codeCharta.model"
import { mergeState } from "../../../state/store/util/setState.reducer.factory"

export const defaultColorLabelOptions: ColorLabelOptions = { positive: false, negative: false, neutral: false }
export const colorLabels = createReducer(defaultColorLabelOptions, on(setColorLabels, mergeState(defaultColorLabelOptions)))
