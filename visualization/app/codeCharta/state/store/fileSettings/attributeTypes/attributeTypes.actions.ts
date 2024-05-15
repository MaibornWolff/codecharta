import { createAction, props } from "@ngrx/store"
import { AttributeTypes, AttributeTypeValue } from "../../../../codeCharta.model"

export const setAttributeTypes = createAction("SET_ATTRIBUTE_TYPES", props<{ value: AttributeTypes }>())
export const updateAttributeType = createAction(
    "UPDATE_ATTRIBUTE_TYPE",
    props<{
        category: keyof AttributeTypes
        name: string
        attributeType: AttributeTypeValue
    }>()
)
