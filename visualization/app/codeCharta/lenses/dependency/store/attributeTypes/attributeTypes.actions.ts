import { createAction, props } from "@ngrx/store"
import { AttributeTypes } from "../../../../model/codeCharta.model"

export const setEdgeAttributeTypes = createAction("SET_EDGE_ATTRIBUTE_TYPES", props<{ value: AttributeTypes }>())
