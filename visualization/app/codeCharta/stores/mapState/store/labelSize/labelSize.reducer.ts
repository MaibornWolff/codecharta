import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../util/setState.reducer.factory"
import { setLabelSize } from "./labelSize.actions"

export const defaultLabelSize = 1
export const labelSize = createReducer(defaultLabelSize, on(setLabelSize, setState(defaultLabelSize)))
