import { createAction, props } from "@ngrx/store"
import { MapColors } from "../../../../codeCharta.model"

export const setMapColors = createAction("SET_MAP_COLORS", props<{ value: Partial<MapColors> }>())
export const invertColorRange = createAction("INVERT_COLOR_RANGE")
export const invertDeltaColors = createAction("INVERT_DELTA_COLORS")
