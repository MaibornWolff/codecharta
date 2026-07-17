import { createAction, props } from "@ngrx/store"
import { Scaling } from "../../../../model/codeCharta.model"

export const setScaling = createAction("SET_SCALING", props<{ value: Partial<Scaling> }>())
