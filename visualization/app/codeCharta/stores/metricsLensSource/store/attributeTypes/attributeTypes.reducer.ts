import { createReducer, on } from "@ngrx/store"
import { AttributeTypeMap } from "../../../../model/codeCharta.model"
import { setState } from "../../../../util/setState.reducer.factory"
import { setAttributeTypes } from "./attributeTypes.actions"

export const defaultAttributeTypes: AttributeTypeMap = {}
export const attributeTypes = createReducer(defaultAttributeTypes, on(setAttributeTypes, setState(defaultAttributeTypes)))
