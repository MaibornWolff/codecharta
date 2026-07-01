/**
 * Public surface of the dependency (edge) lens — the ONLY thing outsiders import (`store/` stays
 * private, enforced by `lens-external-access-only-via-public-surface`). The metrics lens owns node
 * metrics; this lens owns the edge (dependency) metric data derived from each file's edges.
 *
 * Slice 3 exposes the edge-data ngrx selectors for the `createSelector` graphs that consume them (the
 * shrinking `metricDataSelector` aggregator, the edge-preview selectors, the edge effects). An
 * injectable facade + repos/store land when an edge UI feature reads the lens directly — see
 * `migration-2-0-plans/CARRIED-FORWARD.md`.
 */
export { edgeMetricDataSelector, nodeEdgeMetricsMapSelector, edgeMetricNamesSelector } from "./store/dependencyLens.selectors"
export { sortedNodeEdgeMetricsMapSelector } from "./store/sortedNodeEdgeMetricsMap.selector"
