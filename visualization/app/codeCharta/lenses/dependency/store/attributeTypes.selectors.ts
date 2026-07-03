import { createSelector } from "@ngrx/store"
import { AttributeTypeValue } from "../../../codeCharta.model"
import { attributeTypesSelector } from "./attributeTypes/attributeTypes.selector"

/**
 * Edge-side attribute-type map OWNED by the dependency lens.
 *
 * `attributeTypes` is `{ nodes, edges }`; the dependency lens owns the EDGE projection (its edge-metric
 * metadata), the metrics lens the NODE projection (`state.metricsLensSource`). Both are LENS data per
 * ADR 12 (`lenses.metrics` = attributes/descriptors/types/clusters; `lenses.dependency` = edges + edge
 * attribute types/descriptors) — the lens that holds the metric/dependency data owns its types, never the
 * FileStore.
 *
 * Reads the lens-owned `state.dependencyLensSource` root (Slice 14 re-homed the edge side out of the
 * metrics lens's `state.metricsLensSource`). The composing layer combines this with the metrics lens's
 * node types to reconstruct the full `{ nodes, edges }` map the NodeDecorator aggregation + metricsBar
 * label pipeline need.
 */
export const edgeAttributeTypesSelector = createSelector(
    attributeTypesSelector,
    (attributeTypes): { [key: string]: AttributeTypeValue } => attributeTypes.edges ?? {}
)
