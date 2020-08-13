"use strict"
import { AppSettings, CCLocalStorage, DynamicSettings, MetricData, RecursivePartial, Scenario, Settings } from "../codeCharta.model"
import { convertToVectors } from "./settingsHelper"
import { AddScenarioContent, ScenarioMetricType } from "../ui/dialog/dialog.addScenarioSettings.component"
import { ScenarioItem } from "../ui/scenarioDropDown/scenarioDropDown.component"
import scenarios from "../assets/scenarios.json"
import { ExportScenario } from "../codeCharta.api.model"

export class ScenarioHelper {
	private static readonly CC_LOCAL_STORAGE_VERSION = "1.0.0"
	//TODO: Move Scenarios to Redux Store
	private static scenarios: Map<String, RecursivePartial<Scenario>> = ScenarioHelper.loadScenarios()

	public static getScenarioItems(metricData: MetricData[]) {
		const scenarioItems: ScenarioItem[] = []

		this.scenarios.forEach(scenario => {
			scenarioItems.push({
				scenarioName: scenario.name,
				isScenarioAppliable: this.isScenarioAppliable(scenario, metricData),
				icons: [
					{
						faIconClass: "fa-video-camera",
						isSaved: !!scenario.camera,
						tooltip: "Camera angle"
					},
					{
						faIconClass: "fa-arrows-alt",
						isSaved: !!scenario.area,
						tooltip: "Area metric"
					},
					{
						faIconClass: "fa-arrows-v",
						isSaved: !!scenario.height,
						tooltip: "Height metric"
					},
					{
						faIconClass: "fa-paint-brush",
						isSaved: !!scenario.color,
						tooltip: "Color metric"
					},
					{
						faIconClass: "fa-exchange",
						isSaved: !!scenario.edge,
						tooltip: "Edge metric"
					}
				]
			})
		})
		return scenarioItems
	}

	private static isScenarioAppliable(scenario: RecursivePartial<Scenario>, metricData: MetricData[]) {
		if (scenario.area && !metricData.find(x => x.name === scenario.area.areaMetric)) {
			return false
		}
		if (scenario.color && !metricData.find(x => x.name === scenario.color.colorMetric)) {
			return false
		}
		if (scenario.height && !metricData.find(x => x.name === scenario.height.heightMetric)) {
			return false
		}

		return true
	}

	private static getPreLoadScenarios(): Map<String, RecursivePartial<Scenario>> {
		const scenariosAsSettings: ExportScenario[] = this.importScenarios(scenarios)
		const scenario: Map<String, RecursivePartial<Scenario>> = new Map<String, RecursivePartial<Scenario>>()
		scenariosAsSettings.forEach(scenarioSettings => {
			scenario.set(scenarioSettings.name, this.transformScenarioAsSettingsToScenario(scenarioSettings))
		})
		return scenario
	}

	private static transformScenarioAsSettingsToScenario(scenarioAsSettings: ExportScenario) {
		const scenario: RecursivePartial<Scenario> = { name: scenarioAsSettings.name }
		const dynamicSettings: RecursivePartial<DynamicSettings> = scenarioAsSettings.settings.dynamicSettings
		const appSettings: RecursivePartial<AppSettings> = scenarioAsSettings.settings.appSettings

		for (const scenarioKey in dynamicSettings) {
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

	private static setScenariosToLocalStorage(scenarios: Map<String, RecursivePartial<Scenario>>) {
		const newLocalStorageElement: CCLocalStorage = {
			version: this.CC_LOCAL_STORAGE_VERSION,
			scenarios: [...scenarios]
		}
		localStorage.setItem("scenarios", JSON.stringify(newLocalStorageElement))
	}

	private static loadScenarios(): Map<String, RecursivePartial<Scenario>> {
		const ccLocalStorage: CCLocalStorage = JSON.parse(localStorage.getItem("scenarios"))
		if (ccLocalStorage) {
			return new Map(ccLocalStorage.scenarios)
		} else {
			this.setScenariosToLocalStorage(this.getPreLoadScenarios())
			return this.getPreLoadScenarios()
		}
	}

	public static addScenario(newScenario: RecursivePartial<Scenario>) {
		this.scenarios.set(newScenario.name, newScenario)
		this.setScenariosToLocalStorage(this.scenarios)
	}

	public static createNewScenario(scenarioName: string, scenarioAttributes: AddScenarioContent[]) {
		const newScenario: RecursivePartial<Scenario> = { name: scenarioName }

		scenarioAttributes.forEach(attribute => {
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
						margin: attribute.savedValues
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
		})

		return newScenario
	}

	public static deleteScenario(scenarioName: String) {
		this.scenarios.delete(scenarioName)
		this.setScenariosToLocalStorage(this.scenarios)
	}

	public static getDefaultScenarioSetting(): RecursivePartial<Settings> {
		return this.getScenarioSettingsByName("Complexity")
	}

	public static getScenarioSettingsByName(name: string): RecursivePartial<Settings> {
		const scenario: RecursivePartial<Scenario> = this.scenarios.get(name)
		const partialDynamicSettings: RecursivePartial<DynamicSettings> = {}
		const partialAppSettings: RecursivePartial<AppSettings> = {}
		for (const scenarioKey in scenario) {
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

	public static importScenarios(scenarios: ExportScenario[]): ExportScenario[] {
		scenarios.forEach(scenario => {
			convertToVectors(scenario.settings)
		})
		return scenarios
	}

	public static isScenarioExisting(scenarioName: string) {
		return this.scenarios.has(scenarioName)
	}
}
