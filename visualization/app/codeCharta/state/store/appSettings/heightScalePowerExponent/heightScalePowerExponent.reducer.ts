import { createReducer, on } from "@ngrx/store"
import { setHeightScalePowerExponent } from "./heightScalePowerExponent.actions"
import { setState } from "../../util/setState.reducer.factory"

export const defaultHeightScalePowerExponent = 0.5
export const heightScalePowerExponent = createReducer(
    defaultHeightScalePowerExponent,
    on(setHeightScalePowerExponent, setState(defaultHeightScalePowerExponent))
)
