import { createSelector } from "@ngrx/store"
import { AttributeTypeValue } from "../../../model/codeCharta.model"
import { attributeTypesSelector } from "../../../stores/metricsLensSource/metricsLensSource.read.facade"

export { attributeDescriptorsSelector as nodeAttributeDescriptorsSelector } from "../../../stores/metricsLensSource/metricsLensSource.read.facade"

export const nodeAttributeTypesSelector = createSelector(
    attributeTypesSelector,
    (attributeTypes): { [key: string]: AttributeTypeValue } => attributeTypes.nodes ?? {}
)
