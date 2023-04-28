import { createAction, props } from "@ngrx/store"
import { SharpnessMode } from "../../../../codeCharta.model"

export const setSharpnessMode = createAction("SET_SHARPNESS_MODE", props<{ value: SharpnessMode }>())
