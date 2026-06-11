import { createAction, props } from "@ngrx/store"
import { AttributeTypes } from "../../../../codeCharta.model"

export const setAttributeTypes = createAction("SET_ATTRIBUTE_TYPES", props<{ value: AttributeTypes }>())
