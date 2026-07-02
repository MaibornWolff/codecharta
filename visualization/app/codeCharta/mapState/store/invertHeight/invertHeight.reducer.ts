import { createReducer, on } from "@ngrx/store"
import { setInvertHeight } from "./invertHeight.actions"
import { setState } from "../../../state/store/util/setState.reducer.factory"

export const defaultInvertHeight = false
export const invertHeight = createReducer(defaultInvertHeight, on(setInvertHeight, setState(defaultInvertHeight)))
