import { createReducer, on } from "@ngrx/store"
import { setLabelSize } from "./labelSize.actions"
import { setState } from "../../util/setState.reducer.factory"

export const defaultLabelSize = 1
export const labelSize = createReducer(defaultLabelSize, on(setLabelSize, setState(defaultLabelSize)))
