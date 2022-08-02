import { Scenario } from "../../../../codeCharta.model"
import { CcState } from "../../../../state/store/store"
import { ScenarioMetricProperty } from "../../../../util/scenarioHelper"

export const getInitialScenarioMetricProperties = (state: CcState, camera: Scenario["camera"]): ScenarioMetricProperty[] => {
	const { dynamicSettings, appSettings, fileSettings } = state
	return [
		{
			metricType: "Camera-Position",
			metricName: "",
			savedValues: { ...camera },
			isSelected: true,
			isDisabled: false
		},
		{
			metricType: "Area-Metric",
			metricName: dynamicSettings.areaMetric,
			savedValues: dynamicSettings.margin,
			isSelected: true,
			isDisabled: false
		},
		{
			metricType: "Height-Metric",
			metricName: dynamicSettings.heightMetric,
			savedValues: {
				heightSlider: appSettings.scaling,
				labelSlider: appSettings.amountOfTopLabels
			},
			isSelected: true,
			isDisabled: false
		},
		{
			metricType: "Color-Metric",
			metricName: dynamicSettings.colorMetric,
			savedValues: {
				colorRange: dynamicSettings.colorRange,
				mapColors: appSettings.mapColors
			},
			isSelected: true,
			isDisabled: false
		},
		{
			metricType: "Edge-Metric",
			metricName: dynamicSettings.edgeMetric,
			savedValues: {
				edgePreview: appSettings.amountOfEdgePreviews,
				edgeHeight: appSettings.edgeHeight
			},
			isSelected: fileSettings.edges.length > 0,
			isDisabled: fileSettings.edges.length === 0
		}
	]
}
