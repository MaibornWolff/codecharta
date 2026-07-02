import { createReducer, on } from "@ngrx/store"
import { setAmountOfTopLabels } from "./amountOfTopLabels.actions"
import { setState } from "../../../state/store/util/setState.reducer.factory"

export const defaultAmountOfTopLabels = 10
export const amountOfTopLabels = createReducer(defaultAmountOfTopLabels, on(setAmountOfTopLabels, setState(defaultAmountOfTopLabels)))
