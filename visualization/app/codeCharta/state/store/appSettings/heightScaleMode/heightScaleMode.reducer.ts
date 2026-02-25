import { createReducer, on } from "@ngrx/store"
import { setHeightScaleMode } from "./heightScaleMode.actions"
import { setState } from "../../util/setState.reducer.factory"
import { HeightScaleMode } from "../../../../codeCharta.model"

export const defaultHeightScaleMode = HeightScaleMode.Linear
export const heightScaleMode = createReducer(defaultHeightScaleMode, on(setHeightScaleMode, setState(defaultHeightScaleMode)))
