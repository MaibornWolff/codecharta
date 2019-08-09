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

export interface DistributionMetricSubscriber {
	onDistributionMetricChanged(distributionMetric: string)
}

export interface SearchPatternSubscriber {
	onSearchPatternChanged(searchPattern: string)
}

export interface MarginSubscriber {
	onMarginChanged(margin: number)
}

export interface DynamicMarginSubscriber {
	onDynamicMarginChanged(dynamicMargin: boolean)
}

export enum SettingsEvents {
	SETTINGS_CHANGED_EVENT = "settings-changed",
	BLACKLIST_CHANGED_EVENT = "blacklist-changed",
	AREA_METRIC_CHANGED_EVENT = "area-metric-changed",
	HEIGHT_METRIC_CHANGED_EVENT = "height-metric-changed",
	COLOR_METRIC_CHANGED_EVENT = "color-metric-changed",
	DISTRIBUTION_METRIC_CHANGED_EVENT = "distribution-metric-changed",
	SEARCH_PATTERN_CHANGED_EVENT = "search-pattern-changed",
	MARGIN_CHANGED_EVENT = "margin-changed",
	DYNAMIC_MARGIN_CHANGED_EVENT = "dynamic-margin-changed"
}
