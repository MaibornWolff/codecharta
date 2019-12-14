export interface FocusNodeSubscriber {
	onFocusNode(focusedNodePath: string)
}

export interface UnfocusNodeSubscriber {
	onUnfocusNode()
}

export enum SettingsEvents {
	SETTINGS_CHANGED_EVENT = "settings-changed",
	BLACKLIST_CHANGED_EVENT = "blacklist-changed",
	AREA_METRIC_CHANGED_EVENT = "area-metric-changed",
	HEIGHT_METRIC_CHANGED_EVENT = "height-metric-changed",
	COLOR_METRIC_CHANGED_EVENT = "color-metric-changed",
	EDGE_METRIC_CHANGED_EVENT = "edge-metric-changed",
	DISTRIBUTION_METRIC_CHANGED_EVENT = "distribution-metric-changed",
	SEARCH_PATTERN_CHANGED_EVENT = "search-pattern-changed",
	NODE_FOCUSED_EVENT = "node-focused",
	NODE_UNFOCUSED_EVENT = "node-unfocused"
}
