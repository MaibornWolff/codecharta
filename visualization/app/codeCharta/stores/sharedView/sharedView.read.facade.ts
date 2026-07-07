/**
 * READ surface of the sharedView state-home (Slice 13 CQRS split) — selectors, the root selector,
 * the read helper, and the store wiring (combined reducer + `defaultSharedView`).
 *
 * sharedView owns the cross-renderer view values that are neither map-specific settings nor cc.json
 * source: the focus stack (`focusedNodePath`), the search pattern (`searchPattern`), the `blacklist`
 * and the `markedPackages`.
 *
 * Slice 13b split the old single `sharedView.facade` barrel into this read facade and a
 * `sharedView.write.facade` (action creators). This barrel re-exports the combined `sharedView`
 * reducer + `defaultSharedView` (store wiring for `state.manager`), each slice's read selectors, and
 * the pure `findIndexOfMarkedPackageOrParent` read helper. Slice 18c made every re-export explicit (no
 * more `export *`) and dropped the ones no consumer imported via the facade — the per-slice reducers
 * and the `sharedViewSelector` root selector are imported directly. It re-exports NO action creator —
 * enforced by the `state-home-read-facade-has-no-dispatch` dep-cruiser rule.
 */
export { defaultSharedView, sharedView } from "./store/sharedView.reducer"
export { focusedNodePathSelector } from "./store/focusedNodePath/focusedNodePath.selector"
export { currentFocusedNodePathSelector } from "./store/focusedNodePath/currentFocused.selector"
export { searchPatternSelector } from "./store/searchPattern/searchPattern.selector"
export { blacklistSelector } from "./store/blacklist/blacklist.selector"
export { createBlacklistItemSelector } from "./store/blacklist/blacklistByType.selector"
export { blacklistMatcherSelector } from "./store/blacklist/blacklistMatcher.selector"
export { markedPackagesSelector } from "./store/markedPackages/markedPackages.selector"
export { findIndexOfMarkedPackageOrParent } from "./store/markedPackages/util/findIndexOfMarkedPackageOrParent"
export { hoveredNodeIdSelector } from "./store/hoveredNodeId/hoveredNodeId.selector"
export { selectedBuildingIdSelector } from "./store/selectedBuildingId/selectedBuildingId.selector"
export { rightClickedNodeDataSelector } from "./store/rightClickedNodeData/rightClickedNodeData.selector"
