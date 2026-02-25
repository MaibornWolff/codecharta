import { createAction, props } from "@ngrx/store"
import { HeightScaleMode } from "../../../../codeCharta.model"

export const setHeightScaleMode = createAction("SET_HEIGHT_SCALE_MODE", props<{ value: HeightScaleMode }>())
