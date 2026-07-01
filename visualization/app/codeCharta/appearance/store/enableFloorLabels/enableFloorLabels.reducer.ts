import { createReducer, on } from "@ngrx/store"
import { setEnableFloorLabels } from "./enableFloorLabels.actions"
import { setState } from "../../../state/store/util/setState.reducer.factory"

export const defaultEnableFloorLabels = true
export const enableFloorLabels = createReducer(defaultEnableFloorLabels, on(setEnableFloorLabels, setState(defaultEnableFloorLabels)))
