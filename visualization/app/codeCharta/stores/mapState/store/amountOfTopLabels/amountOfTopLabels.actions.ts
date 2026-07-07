import { createAction, props } from "@ngrx/store"

export const setAmountOfTopLabels = createAction("SET_AMOUNT_OF_TOP_LABELS", props<{ value: number }>())
