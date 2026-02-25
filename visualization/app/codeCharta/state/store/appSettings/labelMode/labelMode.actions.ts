import { createAction, props } from "@ngrx/store"
import { LabelMode } from "../../../../codeCharta.model"

export const setLabelMode = createAction("SET_LABEL_MODE", props<{ value: LabelMode }>())
