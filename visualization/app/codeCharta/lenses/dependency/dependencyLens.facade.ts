/**
 * Public surface of the dependency (edge) lens — the ONLY thing outsiders import (`store/` stays
 * private, enforced by `lens-external-access-only-via-public-surface`). The metrics lens owns node
 * metrics; this lens owns the edge (dependency) metric computation derived from each file's edges.
 *
 * Slice 9b lifted the view-state-aware edge selectors (blacklist + edge-visibility) OUT of the lens
 * into derived selectors under `renderModel/edgeMetricData/`. What the lens exposes now is the RAW
 * pure computation `calculateEdgeMetricData(visibleFileStates, matcher)`; the derived selectors compose
 * it with the sharedView blacklist + mapState edge-visibility. So the lens reads no home selector.
 *
 * An injectable facade + repos/store land when an edge UI feature reads the lens directly — see
 * `migration-2-0-plans/CARRIED-FORWARD.md`.
 */
export { calculateEdgeMetricData } from "./store/edgeMetricData.calculator"

// Edge attribute-type map — the dependency lens owns the edge side of the cc.json `attributeTypes`
// (Slice 14 re-homed it out of the metrics lens's `state.metricsLensSource`). The composing layer
// combines it with the metrics lens's node types to reconstruct the full `{ nodes, edges }` map the
// NodeDecorator aggregation (`accumulatedData`) + the metricsBar attribute-type label pipeline need.
export { edgeAttributeTypesSelector } from "./store/attributeTypes.selectors"

// The merged edges of the currently visible files (Slice 15e) — derived from fileStore, replacing the
// former `state.fileSettings.edges` slice (edges were never owned/mutated, only ever re-derived).
export { edgesSelector } from "./store/edges.selector"
