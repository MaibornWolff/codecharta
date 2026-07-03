/**
 * Load-time WRITE + store-wiring surface of the dependency lens's cc.json source (the EDGE attribute
 * types). Kept separate from the read facade (`dependencyLens.facade.ts`, query-only) so the read surface
 * physically cannot dispatch. The twin of the metrics lens's `metricsLens.load.facade`, one step later
 * (Slice 14 re-homed the edge side of `attributeTypes` out of `state.metricsLensSource`).
 *
 * It exposes:
 *   - the write action (`setEdgeAttributeTypes`) the load applier + the `updateFileSettings` effect use to
 *     seed the edge source on file load;
 *   - the combined `dependencyLensSource` reducer + `defaultDependencyLensSource` that `state.manager`
 *     registers as the `state.dependencyLensSource` root and IndexedDB seeds its migration from.
 *
 * Outsiders reach the lens source only through this facade (or the read facade), never the `store/`
 * internals — enforced by `lens-external-access-only-via-public-surface` + `lens-owns-ccjson-source`.
 */
export { setEdgeAttributeTypes } from "./store/attributeTypes/attributeTypes.actions"
export { dependencyLensSource, defaultDependencyLensSource } from "./store/dependencyLensSource.reducer"
