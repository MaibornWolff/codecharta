import { createAction, props } from "@ngrx/store"
import { LayoutAlgorithm } from "../../../../model/codeCharta.model"

export const setLayoutAlgorithm = createAction("SET_LAYOUT_ALGORITHM", props<{ value: LayoutAlgorithm }>())
