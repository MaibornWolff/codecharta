/**
 * Load-time WRITE + store-wiring surface of the metrics lens's cc.json source (attributeTypes +
 * attributeDescriptors). Kept separate from the read facade (`metricsLens.facade.ts`, query-only) so the
 * read surface physically cannot dispatch.
 *
 * It exposes:
 *   - the two write actions (`setAttributeTypes` / `setAttributeDescriptors`) the load applier +
 *     the `updateFileSettings` effect use to seed the source on file load;
 *   - the combined `metricsLensSource` reducer + `defaultMetricsLensSource` that `state.manager`
 *     registers as the `state.metricsLensSource` root and IndexedDB seeds its migration from.
 *
 * Outsiders reach the lens source only through this facade (or the read facade), never the `store/`
 * internals — enforced by `lens-external-access-only-via-public-surface`.
 */
export { setAttributeTypes } from "./store/attributeTypes/attributeTypes.actions"
export { setAttributeDescriptors } from "./store/attributeDescriptors/attributeDescriptors.action"
export { attributeTypes, defaultAttributeTypes } from "./store/attributeTypes/attributeTypes.reducer"
export { attributeDescriptors, defaultAttributeDescriptors } from "./store/attributeDescriptors/attributeDescriptors.reducer"
export { metricsLensSource, defaultMetricsLensSource } from "./store/metricsLensSource.reducer"
