import { createReducer, on } from "@ngrx/store"
import { setScaling } from "./scaling.actions"
import { Scaling } from "../../../../codeCharta.model"
import { mergeState } from "../../util/setState.reducer.factory"

export const defaultScaling: Scaling = { x: 1, y: 1, z: 1 }
export const scaling = createReducer(defaultScaling, on(setScaling, mergeState(defaultScaling)))
