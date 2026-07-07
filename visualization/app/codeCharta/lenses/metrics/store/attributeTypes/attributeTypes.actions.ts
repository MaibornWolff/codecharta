import { createAction, props } from "@ngrx/store"
import { AttributeTypes } from "../../../../model/codeCharta.model"

export const setAttributeTypes = createAction("SET_ATTRIBUTE_TYPES", props<{ value: AttributeTypes }>())
