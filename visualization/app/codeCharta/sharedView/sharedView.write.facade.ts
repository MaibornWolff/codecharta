/**
 * WRITE surface of the sharedView state-home (Slice 13 CQRS split) — the ONLY dispatch surface.
 *
 * This barrel re-exports the sharedView action creators: focus (`setAllFocusedNodes`/`focusNode`/
 * `unfocusNode`/`unfocusAllNodes`), search (`setSearchPattern`), blacklist (`setBlacklist`/
 * `addBlacklistItem(s)`/`removeBlacklistItem(s)`/`addBlacklistItemsIfNotResultsInEmptyMap`) and
 * marked packages (`setMarkedPackages`/`markPackages`/`unmarkPackage`). Writers (feature `stores/`,
 * the `blackListExtension` service, the load applier, the legacy `fileSettings.actions` re-export,
 * save/rerender effects) import from here; display components do not — enforced by the
 * `state-home-write-facade-is-sole-dispatch-surface` and `display-components-cannot-dispatch`
 * dep-cruiser rules. Readers use `sharedView.read.facade`.
 */
export * from "./store/focusedNodePath/focusedNodePath.actions"
export * from "./store/searchPattern/searchPattern.actions"
export * from "./store/blacklist/blacklist.actions"
export * from "./store/markedPackages/markedPackages.actions"
export * from "./store/hoveredNodeId/hoveredNodeId.actions"
export * from "./store/selectedBuildingId/selectedBuildingId.actions"
export * from "./store/rightClickedNodeData/rightClickedNodeData.actions"
