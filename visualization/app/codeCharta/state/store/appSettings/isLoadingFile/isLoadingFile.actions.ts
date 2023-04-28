import { createAction, props } from "@ngrx/store"

export const setIsLoadingFile = createAction("SET_IS_LOADING_FILE", props<{ value: boolean }>())
