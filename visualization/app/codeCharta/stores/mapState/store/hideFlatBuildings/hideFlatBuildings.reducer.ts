import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../util/setState.reducer.factory"
import { setHideFlatBuildings } from "./hideFlatBuildings.actions"

export const defaultHideFlatBuildings = false
export const hideFlatBuildings = createReducer(defaultHideFlatBuildings, on(setHideFlatBuildings, setState(defaultHideFlatBuildings)))
