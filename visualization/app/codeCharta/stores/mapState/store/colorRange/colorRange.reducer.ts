import { createReducer, on } from "@ngrx/store"
import { ColorRange } from "../../../../model/codeCharta.model"
import { mergeState } from "../../../../util/setState.reducer.factory"
import { setColorRange } from "./colorRange.actions"

export const defaultColorRange: ColorRange = { from: 0, to: 0 }
export const colorRange = createReducer(defaultColorRange, on(setColorRange, mergeState(defaultColorRange)))
