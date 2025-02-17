import { createAction, props } from "@ngrx/store"

export const setShowOutgoingEdges = createAction("SET_SHOW_OUTGOING_EDGES", props<{ value: boolean }>())
