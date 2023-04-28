import { createAction, props } from "@ngrx/store"
import { ColorMode } from "../../../../codeCharta.model"

export const setColorMode = createAction("SET_COLOR_MODE", props<{ value: ColorMode }>())
