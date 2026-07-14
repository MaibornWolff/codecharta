import { createAction, props } from "@ngrx/store"
import { AttributeTypeMap } from "../../../../model/codeCharta.model"

export const setAttributeTypes = createAction("SET_ATTRIBUTE_TYPES", props<{ value: AttributeTypeMap }>())
