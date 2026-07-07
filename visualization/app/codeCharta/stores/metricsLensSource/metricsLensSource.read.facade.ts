/**
 * READ / store-wiring surface of the metricsLensSource state home — the cc.json-derived NODE attribute
 * types + descriptors (Slice 19b moved this ngrx state OUT of the metrics lens into stores/, so the ngrx
 * composition root store/ no longer imports lenses/; the metrics lens now READS its source downward from
 * here). Re-exports the combined `metricsLensSource` reducer + `defaultMetricsLensSource` that
 * store/store.ts registers as the `state.metricsLensSource` root and store/state.manager + indexedDBWriter
 * seed, plus the raw source selectors the metrics lens projection reads. NO write actions (see the write
 * facade). External access goes only through this facade, never store/ internals (stores-own-ccjson-source).
 */
export { metricsLensSource, defaultMetricsLensSource } from "./store/metricsLensSource.reducer"
export { attributeTypesSelector } from "./store/attributeTypes/attributeTypes.selector"
export { attributeDescriptorsSelector } from "./store/attributeDescriptors/attributeDescriptors.selector"
