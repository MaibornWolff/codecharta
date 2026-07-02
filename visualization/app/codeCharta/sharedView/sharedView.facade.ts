/**
 * Public surface of the sharedView state-home — the ONLY thing outsiders import.
 *
 * sharedView owns the cross-renderer view values that are neither map-specific settings nor
 * cc.json source: the focus stack (`focusedNodePath`) and the search pattern (`searchPattern`).
 * Slice 8 pulled these two slices out of the `dynamicSettings` combineReducers into their own
 * `state.sharedView` root, so they now persist under `state.sharedView.*`.
 *
 * This barrel re-exports each slice's selectors (read), action creators (write), reducer +
 * `default*` (store wiring), plus — added in the behavioral reshape — the combined `sharedView`
 * reducer, `defaultSharedView`, and the `sharedViewSelector` root selector used by `state.manager`
 * to register the home. Consumers read sharedView only through here; the `store/` internals stay
 * private by convention (the `state-home-is-leaf` dep-cruiser rule locks the leaf direction).
 */
export * from "./store/focusedNodePath/focusedNodePath.actions"
export * from "./store/focusedNodePath/focusedNodePath.reducer"
export * from "./store/focusedNodePath/focusedNodePath.selector"
export * from "./store/focusedNodePath/currentFocused.selector"
export * from "./store/searchPattern/searchPattern.actions"
export * from "./store/searchPattern/searchPattern.reducer"
export * from "./store/searchPattern/searchPattern.selector"
