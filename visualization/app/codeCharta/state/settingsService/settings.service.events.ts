import { BlacklistItem, RecursivePartial, Settings } from "../../codeCharta.model"

export interface SettingsServiceSubscriber {
	onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>)
}

export interface BlacklistSubscriber {
	onBlacklistChanged(blacklist: BlacklistItem[])
}

export interface AreaMetricSubscriber {
	onAreaMetricChanged(areaMetric: string)
}

export interface HeightMetricSubscriber {
	onHeightMetricChanged(heightMetric: string)
}

export interface ColorMetricSubscriber {
	onColorMetricChanged(colorMetric: string)
}

export interface EdgeMetricSubscriber {
	onEdgeMetricChanged(edgeMetric: string)
}

export interface DistributionMetricSubscriber {
	onDistributionMetricChanged(distributionMetric: string)
}

export interface SearchPatternSubscriber {
	onSearchPatternChanged(searchPattern: string)
}

export interface FocusNodePathSubscriber {
	onFocusNodePath(focusedNodePath: string)
}

export interface UnfocusNodePathSubscriber {
	onUnfocusNodePath(unfocusNodePath: string)
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
	NODE_PATH_FOCUSED = "node-path-focused",
	NODE_PATH_UNFOCUSED = "node-path-unfocused"
}
