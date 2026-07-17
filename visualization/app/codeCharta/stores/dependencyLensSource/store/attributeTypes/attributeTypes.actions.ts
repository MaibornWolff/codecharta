import { createAction, props } from "@ngrx/store"
import { AttributeTypeMap } from "../../../../model/codeCharta.model"

export const setEdgeAttributeTypes = createAction("SET_EDGE_ATTRIBUTE_TYPES", props<{ value: AttributeTypeMap }>())
