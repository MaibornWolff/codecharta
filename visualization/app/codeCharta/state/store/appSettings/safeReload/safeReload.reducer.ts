import { createReducer, on } from "@ngrx/store"
import { setSafeReload } from "./safeReload.actions"
import { setState } from "../../util/setState.reducer.factory"

export const defaultSafeReload = false
export const safeReload = createReducer(defaultSafeReload, on(setSafeReload, setState(defaultSafeReload)))
