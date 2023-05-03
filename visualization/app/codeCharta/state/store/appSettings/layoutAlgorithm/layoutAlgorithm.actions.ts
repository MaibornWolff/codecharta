import { createAction, props } from "@ngrx/store"
import { LayoutAlgorithm } from "../../../../codeCharta.model"

export const setLayoutAlgorithm = createAction("SET_LAYOUT_ALGORITHM", props<{ value: LayoutAlgorithm }>())
