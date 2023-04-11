import { createReducer, on } from "@ngrx/store"
import { setAmountOfTopLabels } from "./amountOfTopLabels.actions"

export const defaultAmountOfTopLabels = 1
export const amountOfTopLabels = createReducer(
	defaultAmountOfTopLabels,
	on(setAmountOfTopLabels, (_state, action) => action.value)
)
