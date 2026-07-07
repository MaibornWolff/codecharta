/**
 * READ / store-wiring surface of the dependencyLensSource state home — the cc.json-derived EDGE attribute
 * types (Slice 19b moved this ngrx state OUT of the dependency lens into stores/; the dependency lens now
 * READS its source downward from here). Re-exports the `dependencyLensSource` reducer +
 * `defaultDependencyLensSource` that store/store.ts registers as the `state.dependencyLensSource` root and
 * store/state.manager + indexedDBWriter seed, plus the raw source selector the dependency lens projection
 * reads. NO write action (see the write facade). External access only via this facade (stores-own-ccjson-source).
 */
export { dependencyLensSource, defaultDependencyLensSource } from "./store/dependencyLensSource.reducer"
export { attributeTypesSelector } from "./store/attributeTypes/attributeTypes.selector"
