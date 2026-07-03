import { createSelector } from "@ngrx/store"
import { AttributeTypeValue } from "../../../codeCharta.model"
import { attributeDescriptorsSelector } from "./attributeDescriptors/attributeDescriptors.selector"
import { attributeTypesSelector } from "./attributeTypes/attributeTypes.selector"

/**
 * Node-side attribute maps OWNED by the metrics lens.
 *
 * `attributeTypes` is split into `{ nodes, edges }`: the metrics lens owns the NODE projection (its metric
 * metadata), and the EDGE side re-homes to the dependency lens once that lens gains a source store (CF #2).
 * Both are LENS data per ADR 12 (`lenses.metrics` = attributes/descriptors/types/clusters; `lenses.dependency`
 * = edges + edge attribute types/descriptors) — the lens that holds the metric/dependency data owns its
 * types, never the FileStore. `attributeDescriptors` is a flat metric->descriptor map with no node/edge
 * split, so the lens's node-descriptor source is that map as-is.
 *
 * Both read the lens-owned `state.metricsLensSource` root (Slice 9a moved them out of the `fileSettings`
 * grab-bag). Ratified decision (2026-07-03): attributeTypes/descriptors stay lens-owned — they are NOT
 * file-structure data and do NOT move to the FileStore.
 */
export const nodeAttributeDescriptorsSelector = attributeDescriptorsSelector

export const nodeAttributeTypesSelector = createSelector(
    attributeTypesSelector,
    (attributeTypes): { [key: string]: AttributeTypeValue } => attributeTypes.nodes ?? {}
)
