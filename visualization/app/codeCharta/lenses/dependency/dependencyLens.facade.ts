/**
 * Public surface of the dependency (edge) lens — the ONLY thing outsiders import (`store/` stays
 * private, enforced by `lens-external-access-only-via-public-surface`). The metrics lens owns node
 * metrics; this lens owns the edge (dependency) metric computation derived from each file's edges.
 *
 * Slice 9b lifted the view-state-aware edge selectors (blacklist + edge-visibility) OUT of the lens
 * into derived selectors under `state/selectors/edgeMetricData/`. What the lens exposes now is the RAW
 * pure computation `calculateEdgeMetricData(visibleFileStates, matcher)`; the derived selectors compose
 * it with the sharedView blacklist + mapState edge-visibility. So the lens reads no home selector.
 *
 * An injectable facade + repos/store land when an edge UI feature reads the lens directly — see
 * `migration-2-0-plans/CARRIED-FORWARD.md`.
 */
export { calculateEdgeMetricData } from "./store/edgeMetricData.calculator"
