/**
 * Public surface of the sharedView state-home — the ONLY thing outsiders import.
 *
 * sharedView owns the cross-renderer view values that are neither map-specific settings nor
 * cc.json source: the focus stack (`focusedNodePath`), the search pattern (`searchPattern`) and the
 * `blacklist`. Slice 8 pulled focus/search out of the `dynamicSettings` combineReducers; Slice 9b
 * moved `blacklist` out of the `fileSettings` combineReducers into the `sharedView` combineReducers —
 * all now persist under `state.sharedView.*`. (The .cc.json file still carries the blacklist per-file,
 * so `CCFile.settings.fileSettings` keeps it via an intersection; only the merged STATE root moved here.)
 *
 * This barrel re-exports each slice's selectors (read), action creators (write), reducer +
 * `default*` (store wiring), plus — added in the behavioral reshape — the combined `sharedView`
 * reducer, `defaultSharedView`, and the `sharedViewSelector` root selector used by `state.manager`
 * to register the home. Consumers read sharedView only through here; the `store/` internals stay
 * private by convention (the `state-home-is-leaf` dep-cruiser rule locks the leaf direction).
 */
export * from "./store/sharedView.reducer"
export * from "./store/sharedView.selector"
export * from "./store/focusedNodePath/focusedNodePath.actions"
export * from "./store/focusedNodePath/focusedNodePath.reducer"
export * from "./store/focusedNodePath/focusedNodePath.selector"
export * from "./store/focusedNodePath/currentFocused.selector"
export * from "./store/searchPattern/searchPattern.actions"
export * from "./store/searchPattern/searchPattern.reducer"
export * from "./store/searchPattern/searchPattern.selector"
export * from "./store/blacklist/blacklist.actions"
export * from "./store/blacklist/blacklist.reducer"
export * from "./store/blacklist/blacklist.selector"
export * from "./store/blacklist/blacklistByType.selector"
export * from "./store/blacklist/blacklistMatcher.selector"
