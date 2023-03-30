import { Scenario, State } from "../../../../../codeCharta.model"
import { ScenarioMetricProperty } from "../../scenarioHelper"

export const getInitialScenarioMetricProperties = (state: State, camera: Scenario["camera"]): ScenarioMetricProperty[] => {
	const { dynamicSettings, appSettings, fileSettings } = state
	const properties: ScenarioMetricProperty[] = [
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
		}
	]
	if (fileSettings.edges.length > 0) {
		properties.push({
			metricType: "Edge-Metric",
			metricName: dynamicSettings.edgeMetric,
			savedValues: {
				edgePreview: appSettings.amountOfEdgePreviews,
				edgeHeight: appSettings.edgeHeight
			},
			isSelected: true,
			isDisabled: false
		})
	}
	return properties
}
