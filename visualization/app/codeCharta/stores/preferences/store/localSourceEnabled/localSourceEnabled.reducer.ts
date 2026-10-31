import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../util/setState.reducer.factory"
import { setLocalSourceEnabled } from "./localSourceEnabled.actions"

export const defaultLocalSourceEnabled = false

export const localSourceEnabled = createReducer(defaultLocalSourceEnabled, on(setLocalSourceEnabled, setState(defaultLocalSourceEnabled)))
