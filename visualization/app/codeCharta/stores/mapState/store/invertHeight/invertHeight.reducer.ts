import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../util/setState.reducer.factory"
import { setInvertHeight } from "./invertHeight.actions"

export const defaultInvertHeight = false
export const invertHeight = createReducer(defaultInvertHeight, on(setInvertHeight, setState(defaultInvertHeight)))
