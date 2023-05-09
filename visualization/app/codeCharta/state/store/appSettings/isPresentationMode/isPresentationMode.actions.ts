import { createAction, props } from "@ngrx/store"

export const setPresentationMode = createAction("SET_PRESENTATION_MODE", props<{ value: boolean }>())
