import { createAction, props } from "@ngrx/store"

export const setIsLoadingMap = createAction("SET_IS_LOADING_MAP", props<{ value: boolean }>())
