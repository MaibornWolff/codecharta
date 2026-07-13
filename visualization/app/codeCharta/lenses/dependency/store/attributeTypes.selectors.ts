import { createSelector } from "@ngrx/store"
import { AttributeTypeValue } from "../../../model/codeCharta.model"
import { attributeTypesSelector } from "../../../stores/dependencyLensSource/dependencyLensSource.read.facade"

export const edgeAttributeTypesSelector = createSelector(
    attributeTypesSelector,
    (attributeTypes): { [key: string]: AttributeTypeValue } => attributeTypes.edges ?? {}
)
