import { createSelector } from "@ngrx/store"
import { AttributeTypes } from "../../../model/codeCharta.model"
import { nodeAttributeTypesSelector } from "../../../lenses/metrics/metricsLens.facade"
import { edgeAttributeTypesSelector } from "../../../lenses/dependency/dependencyLens.facade"

/**
 * The full `{ nodes, edges }` attribute-type map, recomposed from the two lens sources: the metrics lens
 * owns the node side, the dependency lens the edge side (Slice 14 split the cc.json `attributeTypes`
 * across the two lenses per ADR 12). The metricsBar attribute-type label pipeline indexes this by channel
 * (nodes for area/height/color, edges for the edge metric), so it needs both sides combined.
 */
export const attributeTypesSelector = createSelector(
    nodeAttributeTypesSelector,
    edgeAttributeTypesSelector,
    (nodes, edges): AttributeTypes => ({ nodes, edges })
)
