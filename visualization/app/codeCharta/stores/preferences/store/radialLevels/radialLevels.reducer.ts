import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../util/setState.reducer.factory"
import { setRadialLevels } from "./radialLevels.actions"

export const defaultRadialLevels = 3
export const radialLevels = createReducer(defaultRadialLevels, on(setRadialLevels, setState(defaultRadialLevels)))
