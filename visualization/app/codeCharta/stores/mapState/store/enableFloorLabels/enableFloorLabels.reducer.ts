import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../util/setState.reducer.factory"
import { setEnableFloorLabels } from "./enableFloorLabels.actions"

export const defaultEnableFloorLabels = true
export const enableFloorLabels = createReducer(defaultEnableFloorLabels, on(setEnableFloorLabels, setState(defaultEnableFloorLabels)))
