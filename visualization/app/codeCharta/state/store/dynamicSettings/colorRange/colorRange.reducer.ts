import { createReducer, on } from "@ngrx/store"
import { setColorRange } from "./colorRange.actions"
import { ColorRange } from "../../../../codeCharta.model"
import { mergeState } from "../../util/setState.reducer.factory"

export const defaultColorRange: ColorRange = { from: 0, to: 0 }
export const colorRange = createReducer(defaultColorRange, on(setColorRange, mergeState(defaultColorRange)))
