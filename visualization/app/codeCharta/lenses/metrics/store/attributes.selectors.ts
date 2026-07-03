import { createSelector } from "@ngrx/store"
import { AttributeTypeValue } from "../../../codeCharta.model"
import { attributeTypesSelector } from "./attributeTypes/attributeTypes.selector"

/**
 * Node-side attribute maps OWNED by the metrics lens.
 *
 * `attributeTypes` is split into `{ nodes, edges }`: the metrics lens owns the NODE projection (its metric
 * metadata), and the EDGE side is owned by the dependency lens's `state.dependencyLensSource` (Slice 14
 * re-homed it there; read it via `dependencyLens.facade`'s `edgeAttributeTypesSelector`). Both are LENS
 * data per ADR 12 (`lenses.metrics` = attributes/descriptors/types/clusters; `lenses.dependency` = edges +
 * edge attribute types/descriptors) — the lens that holds the metric/dependency data owns its types, never
 * the FileStore. `attributeDescriptors` is a flat metric->descriptor map with no node/edge split, so the
 * lens's node-descriptor source is that map as-is.
 *
 * Both read the lens-owned `state.metricsLensSource` root (Slice 9a moved them out of the `fileSettings`
 * grab-bag). Ratified decision (2026-07-03): attributeTypes/descriptors stay lens-owned — they are NOT
 * file-structure data and do NOT move to the FileStore.
 */
export { attributeDescriptorsSelector as nodeAttributeDescriptorsSelector } from "./attributeDescriptors/attributeDescriptors.selector"

export const nodeAttributeTypesSelector = createSelector(
    attributeTypesSelector,
    (attributeTypes): { [key: string]: AttributeTypeValue } => attributeTypes.nodes ?? {}
)
