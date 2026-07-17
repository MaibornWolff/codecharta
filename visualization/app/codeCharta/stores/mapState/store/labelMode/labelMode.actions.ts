import { createAction, props } from "@ngrx/store"
import { LabelMode } from "../../../../model/codeCharta.model"

export const setLabelMode = createAction("SET_LABEL_MODE", props<{ value: LabelMode }>())
