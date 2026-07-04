import { createReducer, on } from "@ngrx/store"
import { setAmountOfTopLabels } from "./amountOfTopLabels.actions"
import { setState } from "../../../util/setState.reducer.factory"
import { defaultAmountOfTopLabels } from "../../../model/state.model"

// Re-exported so the mapState public surface keeps exposing the default (feature consumers read it via
// mapState.read.facade); the canonical definition now lives in model/ (Slice 16i-3).
export { defaultAmountOfTopLabels }
export const amountOfTopLabels = createReducer(defaultAmountOfTopLabels, on(setAmountOfTopLabels, setState(defaultAmountOfTopLabels)))
