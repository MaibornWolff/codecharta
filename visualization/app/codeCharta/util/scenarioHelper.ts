"use strict"
import { AppSettings, CCLocalStorage, DynamicSettings, RecursivePartial, Scenario, Settings, MetricData } from "../codeCharta.model"
import { convertToVectors } from "./settingsHelper"
import { AddScenarioContent, ScenarioMetricType } from "../ui/dialog/dialog.addScenarioSettings.component"
import { ScenarioItem } from "../ui/scenarioDropDown/scenarioDropDown.component"
import scenarios from "../assets/scenarios.json"
import { ExportScenario } from "../codeCharta.api.model"

export class ScenarioHelper {
	private static readonly CC_LOCAL_STORAGE_VERSION = "1.0.0"
	//TODO: Move Scenarios to Redux Store
	private static scenarios: Map<string, RecursivePartial<Scenario>> = ScenarioHelper.loadScenarios()

	static getScenarioItems(metricData: MetricData) {
		const scenarioItems: ScenarioItem[] = []

		for (const scenario of this.scenarios.values()) {
			scenarioItems.push({
				scenarioName: scenario.name,
				isScenarioApplicable: this.isScenarioApplicable(scenario, metricData),
				icons: [
					{
						faIconClass: "fa-video-camera",
						isSaved: Boolean(scenario.camera),
						tooltip: "Camera angle"
					},
					{
						faIconClass: "fa-arrows-alt",
						isSaved: Boolean(scenario.area),
						tooltip: "Area metric"
					},
					{
						faIconClass: "fa-arrows-v",
						isSaved: Boolean(scenario.height),
						tooltip: "Height metric"
					},
					{
						faIconClass: "fa-paint-brush",
						isSaved: Boolean(scenario.color),
						tooltip: "Color metric"
					},
					{
						faIconClass: "fa-exchange",
						isSaved: Boolean(scenario.edge),
						tooltip: "Edge metric"
					}
				]
			})
		}
		return scenarioItems
	}

	private static isScenarioApplicable(scenario: RecursivePartial<Scenario>, metricData: MetricData) {
		const { area, color, height, edge } = scenario

		if (area || color || height) {
			const nodeMetricSet = new Set(metricData.nodeMetricData.map(data => data.name))

			if (
				(area && !nodeMetricSet.has(area.areaMetric)) ||
				(color && !nodeMetricSet.has(color.colorMetric)) ||
				(height && !nodeMetricSet.has(height.heightMetric))
			) {
				return false
			}
		}

		return !(edge && !metricData.edgeMetricData.find(x => x.name === edge.edgeMetric))
	}

	private static getPreLoadScenarios() {
		const scenariosAsSettings = this.importScenarios(scenarios)
		const scenario: Map<string, RecursivePartial<Scenario>> = new Map()
		for (const setting of scenariosAsSettings) {
			scenario.set(setting.name, this.transformScenarioAsSettingsToScenario(setting))
		}
		return scenario
	}

	private static transformScenarioAsSettingsToScenario(scenarioAsSettings: ExportScenario) {
		const scenario: RecursivePartial<Scenario> = { name: scenarioAsSettings.name }
		const { dynamicSettings, appSettings } = scenarioAsSettings.settings

		for (const scenarioKey of Object.keys(dynamicSettings)) {
			switch (scenarioKey) {
				case "areaMetric": {
					scenario.area = {
						areaMetric: dynamicSettings.areaMetric,
						margin: dynamicSettings.margin
					}
					break
				}
				case "heightMetric": {
					scenario.height = {
						heightMetric: dynamicSettings.heightMetric,
						labelSlider: appSettings.amountOfTopLabels,
						heightSlider: appSettings.scaling
					}
					break
				}
				case "colorMetric": {
					scenario.color = {
						colorMetric: dynamicSettings.colorMetric,
						colorRange: dynamicSettings.colorRange
					}
					break
				}
				case "edgeMetric": {
					scenario.edge = {
						edgeMetric: dynamicSettings.edgeMetric,
						edgeHeight: appSettings.edgeHeight,
						edgePreview: appSettings.amountOfEdgePreviews
					}
					break
				}
			}
			if (appSettings.camera) {
				scenario.camera = {
					camera: appSettings.camera,
					cameraTarget: appSettings.cameraTarget
				}
			}
		}

		return scenario
	}

	private static setScenariosToLocalStorage(scenarios: Map<string, RecursivePartial<Scenario>>) {
		const newLocalStorageElement: CCLocalStorage = {
			version: this.CC_LOCAL_STORAGE_VERSION,
			scenarios: [...scenarios]
		}
		localStorage.setItem("scenarios", JSON.stringify(newLocalStorageElement))
	}

	private static loadScenarios() {
		const ccLocalStorage: CCLocalStorage = JSON.parse(localStorage.getItem("scenarios"))
		if (ccLocalStorage) {
			return new Map(ccLocalStorage.scenarios)
		}
		this.setScenariosToLocalStorage(this.getPreLoadScenarios())
		return this.getPreLoadScenarios()
	}

	static addScenario(newScenario: RecursivePartial<Scenario>) {
		this.scenarios.set(newScenario.name, newScenario)
		this.setScenariosToLocalStorage(this.scenarios)
	}

	static createNewScenario(scenarioName: string, scenarioAttributes: AddScenarioContent[]) {
		const newScenario: RecursivePartial<Scenario> = { name: scenarioName }

		for (const attribute of scenarioAttributes) {
			switch (attribute.metricType) {
				case ScenarioMetricType.CAMERA_POSITION: {
					newScenario.camera = {
						camera: attribute.savedValues["camera"],
						cameraTarget: attribute.savedValues["cameraTarget"]
					}
					break
				}
				case ScenarioMetricType.AREA_METRIC: {
					newScenario.area = {
						areaMetric: attribute.metricName,
						margin: attribute.savedValues as number
					}
					break
				}
				case ScenarioMetricType.HEIGHT_METRIC: {
					newScenario.height = {
						heightMetric: attribute.metricName,
						heightSlider: attribute.savedValues["heightSlider"],
						labelSlider: attribute.savedValues["labelSlider"]
					}
					break
				}
				case ScenarioMetricType.COLOR_METRIC: {
					newScenario.color = {
						colorMetric: attribute.metricName,
						colorRange: attribute.savedValues
					}
					break
				}
				case ScenarioMetricType.EDGE_METRIC: {
					newScenario.edge = {
						edgeMetric: attribute.metricName,
						edgePreview: attribute.savedValues["edgePreview"],
						edgeHeight: attribute.savedValues["edgeHeight"]
					}
					break
				}
			}
		}

		return newScenario
	}

	static deleteScenario(scenarioName: string) {
		this.scenarios.delete(scenarioName)
		this.setScenariosToLocalStorage(this.scenarios)
	}

	static getDefaultScenarioSetting() {
		return this.getScenarioSettingsByName("Complexity")
	}

	static getScenarioSettingsByName(name: string): RecursivePartial<Settings> {
		const scenario: RecursivePartial<Scenario> = this.scenarios.get(name)
		const partialDynamicSettings: RecursivePartial<DynamicSettings> = {}
		const partialAppSettings: RecursivePartial<AppSettings> = {}
		for (const scenarioKey of Object.keys(scenario)) {
			switch (scenarioKey) {
				case "area": {
					partialDynamicSettings.areaMetric = scenario.area.areaMetric
					partialDynamicSettings.margin = scenario.area.margin
					break
				}
				case "height": {
					partialDynamicSettings.heightMetric = scenario.height.heightMetric
					partialAppSettings.amountOfTopLabels = scenario.height.labelSlider
					partialAppSettings.scaling = scenario.height.heightSlider
					break
				}
				case "color": {
					partialDynamicSettings.colorMetric = scenario.color.colorMetric
					partialDynamicSettings.colorRange = scenario.color.colorRange
					break
				}
				case "edge": {
					partialDynamicSettings.edgeMetric = scenario.edge.edgeMetric
					partialAppSettings.edgeHeight = scenario.edge.edgeHeight
					partialAppSettings.amountOfEdgePreviews = scenario.edge.edgePreview
					break
				}
				case "camera": {
					partialAppSettings.camera = scenario.camera.camera
					partialAppSettings.cameraTarget = scenario.camera.cameraTarget
				}
			}
		}

		return { appSettings: partialAppSettings, dynamicSettings: partialDynamicSettings }
	}

	static importScenarios(scenarios: ExportScenario[]) {
		for (const scenario of scenarios) {
			convertToVectors(scenario.settings)
		}
		return scenarios
	}

	static isScenarioExisting(scenarioName: string) {
		return this.scenarios.has(scenarioName)
	}
}
