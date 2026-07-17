import { createAction, props } from "@ngrx/store"

export const setShowIncomingEdges = createAction("SET_SHOW_INCOMING_EDGES", props<{ value: boolean }>())
