import { createAction, props } from "@ngrx/store"
import { AttributeDescriptors } from "../../../../codeCharta.model"

export const setAttributeDescriptors = createAction("SET_ATTRIBUTE_DESCRIPTORS", props<{ value: AttributeDescriptors }>())
