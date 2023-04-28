import { createAction, props } from "@ngrx/store"
import { ColorLabelOptions } from "../../../../codeCharta.model"

export const setColorLabels = createAction("SET_COLOR_LABELS", props<{ value: Partial<ColorLabelOptions> }>())
