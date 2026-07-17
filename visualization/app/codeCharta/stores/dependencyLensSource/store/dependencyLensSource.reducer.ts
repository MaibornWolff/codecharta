import { combineReducers } from "@ngrx/store"
import { DependencyLensSource } from "../../../model/codeCharta.model"
import { defaultEdgeAttributeTypes, edgeAttributeTypes } from "./attributeTypes/attributeTypes.reducer"

export const dependencyLensSource = combineReducers({
    attributeTypes: edgeAttributeTypes
})

export const defaultDependencyLensSource: DependencyLensSource = {
    attributeTypes: defaultEdgeAttributeTypes
}
