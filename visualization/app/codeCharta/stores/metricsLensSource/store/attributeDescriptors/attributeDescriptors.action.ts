import { createAction, props } from "@ngrx/store"
import { AttributeDescriptors } from "../../../../model/codeCharta.model"

export const setAttributeDescriptors = createAction("SET_ATTRIBUTE_DESCRIPTORS", props<{ value: AttributeDescriptors }>())
