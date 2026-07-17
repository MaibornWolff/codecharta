import { createSelector } from "@ngrx/store"
import { edgeAttributeTypesSelector } from "../../../lenses/dependency/dependencyLens.facade"
import { nodeAttributeTypesSelector } from "../../../lenses/metrics/metricsLens.facade"
import { AttributeTypes } from "../../../model/codeCharta.model"

export const attributeTypesSelector = createSelector(
    nodeAttributeTypesSelector,
    edgeAttributeTypesSelector,
    (nodes, edges): AttributeTypes => ({ nodes, edges })
)
