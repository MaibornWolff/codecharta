import { createReducer, on } from "@ngrx/store"
import { setHideFlatBuildings } from "./hideFlatBuildings.actions"
import { setState } from "../../util/setState.reducer.factory"

export const defaultHideFlatBuildings = false
export const hideFlatBuildings = createReducer(defaultHideFlatBuildings, on(setHideFlatBuildings, setState(defaultHideFlatBuildings)))
