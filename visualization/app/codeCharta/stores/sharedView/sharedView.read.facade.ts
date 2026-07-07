/**
 * READ surface of the sharedView state-home (Slice 13 CQRS split) — selectors, the root selector,
 * the read helper, and the store wiring (combined reducer + `defaultSharedView`).
 *
 * sharedView owns the cross-renderer view values that are neither map-specific settings nor cc.json
 * source: the focus stack (`focusedNodePath`), the search pattern (`searchPattern`), the `blacklist`
 * and the `markedPackages`.
 *
 * Slice 13b split the old single `sharedView.facade` barrel into this read facade and a
 * `sharedView.write.facade` (action creators). This barrel re-exports each slice's selectors (read),
 * the pure `findIndexOfMarkedPackageOrParent` read helper, and reducer + `default*` (store wiring),
 * plus the combined `sharedView` reducer, `defaultSharedView`, and the `sharedViewSelector` root
 * selector used by `state.manager` to register the home. It re-exports NO action creator — enforced
 * by the `state-home-read-facade-has-no-dispatch` dep-cruiser rule.
 */
export * from "./store/sharedView.reducer"
export * from "./store/sharedView.selector"
export * from "./store/focusedNodePath/focusedNodePath.reducer"
export * from "./store/focusedNodePath/focusedNodePath.selector"
export * from "./store/focusedNodePath/currentFocused.selector"
export * from "./store/searchPattern/searchPattern.reducer"
export * from "./store/searchPattern/searchPattern.selector"
export * from "./store/blacklist/blacklist.reducer"
export * from "./store/blacklist/blacklist.selector"
export * from "./store/blacklist/blacklistByType.selector"
export * from "./store/blacklist/blacklistMatcher.selector"
export * from "./store/markedPackages/markedPackages.reducer"
export * from "./store/markedPackages/markedPackages.selector"
export * from "./store/markedPackages/util/findIndexOfMarkedPackageOrParent"
export * from "./store/hoveredNodeId/hoveredNodeId.reducer"
export * from "./store/hoveredNodeId/hoveredNodeId.selector"
export * from "./store/selectedBuildingId/selectedBuildingId.reducer"
export * from "./store/selectedBuildingId/selectedBuildingId.selector"
export * from "./store/rightClickedNodeData/rightClickedNodeData.reducer"
export * from "./store/rightClickedNodeData/rightClickedNodeData.selector"
