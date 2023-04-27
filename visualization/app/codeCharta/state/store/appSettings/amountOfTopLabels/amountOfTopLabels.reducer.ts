import { createReducer, on } from "@ngrx/store"
import { setAmountOfTopLabels } from "./amountOfTopLabels.actions"
import { setState } from "../../util/setState.reducer.factory"

export const defaultAmountOfTopLabels = 1
export const amountOfTopLabels = createReducer(defaultAmountOfTopLabels, on(setAmountOfTopLabels, setState(defaultAmountOfTopLabels)))
