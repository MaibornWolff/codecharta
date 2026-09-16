import { createReducer, on } from "@ngrx/store"
import { setState } from "../../../../util/setState.reducer.factory"
import { setCenterMapZoom } from "./centerMapZoom.actions"

export const defaultCenterMapZoom = 140
export const centerMapZoom = createReducer(defaultCenterMapZoom, on(setCenterMapZoom, setState(defaultCenterMapZoom)))
