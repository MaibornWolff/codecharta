import { createAction, props } from "@ngrx/store"
import { ColorRange } from "../../../../model/codeCharta.model"

export const setColorRange = createAction("SET_COLOR_RANGE", props<{ value: Partial<ColorRange> }>())
