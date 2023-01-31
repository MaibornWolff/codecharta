import { fileStatesAvailable } from "../../../model/files/files.helper"
import { createSelector } from "../../angular-redux/createSelector"
import { areaMetricSelector } from "../../store/dynamicSettings/areaMetric/areaMetric.selector"
import { colorMetricSelector } from "../../store/dynamicSettings/colorMetric/colorMetric.selector"
import { dynamicSettingsSelector } from "../../store/dynamicSettings/dynamicSettings.selector"
import { heightMetricSelector } from "../../store/dynamicSettings/heightMetric/heightMetric.selector"
import { filesSelector } from "../../store/files/files.selector"
import { metricDataSelector } from "../accumulatedData/metricData/metricData.selector"
import { areDynamicSettingsAvailable } from "./utils/areDynamicSettingsAvailable"
import { areMetricsAvailable } from "./utils/areMetricsAvailable"

const areFileStatesAvailableSelector = createSelector([filesSelector], files => fileStatesAvailable(files))

export const areChosenMetricsAvailableSelector = createSelector(
	[metricDataSelector, areaMetricSelector, colorMetricSelector, heightMetricSelector],
	(metricData, areaMetric, colorMetric, heightMetric) =>
		areMetricsAvailable(metricData.nodeMetricData, [areaMetric, colorMetric, heightMetric])
)

const areDynamicSettingsAvailableSelector = createSelector([dynamicSettingsSelector], dynamicSettings =>
	areDynamicSettingsAvailable(dynamicSettings)
)

export const areAllNecessaryRenderDataAvailableSelector = createSelector(
	[metricDataSelector, areFileStatesAvailableSelector, areChosenMetricsAvailableSelector, areDynamicSettingsAvailableSelector],
	(metricData, areFileStatesAvailable, areChosenMetricsAvailable, areDynamicSettingsAvailable) => {
		if (metricData.nodeMetricData === null || !areFileStatesAvailable || !areChosenMetricsAvailable || !areDynamicSettingsAvailable) {
			return false
		}

		return true
	}
)
