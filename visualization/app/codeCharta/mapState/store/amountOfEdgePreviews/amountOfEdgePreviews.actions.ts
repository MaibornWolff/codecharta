import { createAction, props } from "@ngrx/store"

export const setAmountOfEdgePreviews = createAction("SET_AMOUNT_OF_EDGE_PREVIEWS", props<{ value: number }>())
