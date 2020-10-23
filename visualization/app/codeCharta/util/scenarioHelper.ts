"use strict"
import { AppSettings, LocalStorageScenarios, DynamicSettings, RecursivePartial, Scenario, Settings, MetricData } from "../codeCharta.model"
import { convertToVectors } from "./settingsHelper"
import { AddScenarioContent, ScenarioMetricType } from "../ui/dialog/dialog.addScenarioSettings.component"
import { ScenarioItem } from "../ui/scenarioDropDown/scenarioDropDown.component"
import scenarios from "../assets/scenarios.json"
import { ExportScenario } from "../codeCharta.api.model"

export class ScenarioHelper {
	private static readonly SCENARIOS_LOCAL_STORAGE_VERSION = "1.0.0"
	private static readonly SCENARIOS_LOCAL_STORAGE_ELEMENT = "customViews"
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

		if (dynamicSettings.areaMetric !== undefined) {
			scenario.area = {
				areaMetric: dynamicSettings.areaMetric,
				margin: dynamicSettings.margin
			}
		}
		if (dynamicSettings.heightMetric !== undefined) {
			scenario.height = {
				heightMetric: dynamicSettings.heightMetric,
				labelSlider: appSettings.amountOfTopLabels,
				heightSlider: appSettings.scaling
			}
		}
		if (dynamicSettings.colorMetric !== undefined) {
			scenario.color = {
				colorMetric: dynamicSettings.colorMetric,
				colorRange: dynamicSettings.colorRange
			}
		}
		if (dynamicSettings.edgeMetric !== undefined) {
			scenario.edge = {
				edgeMetric: dynamicSettings.edgeMetric,
				edgeHeight: appSettings.edgeHeight,
				edgePreview: appSettings.amountOfEdgePreviews
			}
		}
		if (appSettings.camera) {
			scenario.camera = {
				camera: appSettings.camera,
				cameraTarget: appSettings.cameraTarget
			}
		}

		return scenario
	}

	private static setScenariosToLocalStorage(scenarios: Map<string, RecursivePartial<Scenario>>) {
		const newLocalStorageElement: LocalStorageScenarios = {
			version: this.SCENARIOS_LOCAL_STORAGE_VERSION,
			scenarios: [...scenarios]
		}
		localStorage.setItem(this.SCENARIOS_LOCAL_STORAGE_ELEMENT, JSON.stringify(newLocalStorageElement))
	}

	private static loadScenarios() {
		const ccLocalStorage: LocalStorageScenarios = JSON.parse(localStorage.getItem(this.SCENARIOS_LOCAL_STORAGE_ELEMENT))
		if (ccLocalStorage) {
			return new Map(ccLocalStorage.scenarios)
		}
		const scenarios = this.getPreLoadScenarios()
		this.setScenariosToLocalStorage(scenarios)
		return scenarios
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
				default:
					throw new Error(`Unknown metric type "${attribute.metricType}" detected`)
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
		const scenario = this.scenarios.get(name)
		const partialDynamicSettings: RecursivePartial<DynamicSettings> = {}
		const partialAppSettings: RecursivePartial<AppSettings> = {}

		if (scenario) {
			if (scenario.area) {
				partialDynamicSettings.areaMetric = scenario.area.areaMetric
				partialDynamicSettings.margin = scenario.area.margin
			}
			if (scenario.height) {
				partialDynamicSettings.heightMetric = scenario.height.heightMetric
				partialAppSettings.amountOfTopLabels = scenario.height.labelSlider
				partialAppSettings.scaling = scenario.height.heightSlider
			}
			if (scenario.color) {
				partialDynamicSettings.colorMetric = scenario.color.colorMetric
				partialDynamicSettings.colorRange = scenario.color.colorRange
			}
			if (scenario.edge) {
				partialDynamicSettings.edgeMetric = scenario.edge.edgeMetric
				partialAppSettings.edgeHeight = scenario.edge.edgeHeight
				partialAppSettings.amountOfEdgePreviews = scenario.edge.edgePreview
			}
			if (scenario.camera) {
				partialAppSettings.camera = scenario.camera.camera
				partialAppSettings.cameraTarget = scenario.camera.cameraTarget
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
