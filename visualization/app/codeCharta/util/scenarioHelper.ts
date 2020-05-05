"use strict"
import {
	AppSettings,
	CCLocalStorage,
	DynamicSettings,
	MetricData,
	RecursivePartial,
	ScenarioAsSettings,
	Scenery,
	Settings
} from "../codeCharta.model"
import { convertToVectors } from "./settingsHelper"
import { AddScenarioContent, ScenarioMetricType } from "../ui/dialog/dialog.addScenarioSettings.component"
import { ScenarioItem } from "../ui/scenarioDropDown/scenarioDropDown.component"

export class ScenarioHelper {
	//TODO: Move Scenarios to Redux Store
	private static scenarioList: RecursivePartial<Scenery>[] = ScenarioHelper.loadScenarios()

	public static getScenarioItems(metricData: MetricData[]) {
		const scenarioItemList: ScenarioItem[] = []

		this.scenarioList.forEach(scenery => {
			scenarioItemList.push({
				scenarioName: scenery.name,
				isScenarioAppliable: this.isScenarioAppliable(scenery, metricData),
				icons: [
					{
						faIconClass: "fa-video-camera",
						isSaved: !!scenery.camera
					},
					{
						faIconClass: "fa-arrows-alt",
						isSaved: !!scenery.area
					},
					{
						faIconClass: "fa-paint-brush",
						isSaved: !!scenery.color
					},
					{
						faIconClass: "fa-arrows-v",
						isSaved: !!scenery.height
					},
					{
						faIconClass: "fa-exchange",
						isSaved: !!scenery.edge
					}
				]
			})
		})
		return scenarioItemList
	}

	private static isScenarioAppliable(scenario: RecursivePartial<Scenery>, metricData: MetricData[]) {
		if (scenario.area && !metricData.find(value => value.name === scenario.area.areaMetric)) {
			return false
		}
		if (scenario.color && !metricData.find(value => value.name === scenario.color.colorMetric)) {
			return false
		}
		if (scenario.height && !metricData.find(value => value.name === scenario.height.heightMetric)) {
			return false
		}

		return true
	}

	private static getPreLoadScenarios() {
		const scenariosAsSettings: ScenarioAsSettings[] = this.importScenarios(require("../assets/scenarios.json"))
		const scenery: RecursivePartial<Scenery>[] = []
		scenariosAsSettings.forEach(scenarioSettings => {
			scenery.push(this.transformScenarioToScenery(scenarioSettings))
		})
		return scenery
	}

	private static transformScenarioToScenery(scenarioAsSettings: ScenarioAsSettings) {
		const scenery: RecursivePartial<Scenery> = { name: scenarioAsSettings.name }
		const dynamicSettings: RecursivePartial<DynamicSettings> = scenarioAsSettings.settings.dynamicSettings
		const appSettings: RecursivePartial<AppSettings> = scenarioAsSettings.settings.appSettings

		for (const scenarioKey in dynamicSettings) {
			switch (scenarioKey) {
				case "areaMetric": {
					scenery.area = {
						areaMetric: dynamicSettings.areaMetric,
						margin: dynamicSettings.margin
					}
					break
				}
				case "heightMetric": {
					scenery.height = {
						heightMetric: dynamicSettings.heightMetric,
						labelSlider: appSettings.amountOfTopLabels,
						heightSlider: appSettings.scaling
					}
					break
				}
				case "colorMetric": {
					scenery.color = {
						colorMetric: dynamicSettings.colorMetric,
						colorRange: dynamicSettings.colorRange
					}
					break
				}
				case "edgeMetric": {
					scenery.edge = {
						edgeMetric: dynamicSettings.edgeMetric,
						edgeHeight: appSettings.edgeHeight,
						edgePreview: appSettings.amountOfEdgePreviews
					}
					break
				}
			}
			if (appSettings.camera) {
				scenery.camera = {
					camera: appSettings.camera,
					cameraTarget: appSettings.cameraTarget
				}
			}
		}

		return scenery
	}

	private static setScenariosToLocalStorage(scenarios: RecursivePartial<Scenery>[]) {
		const newLocalStorageElement: CCLocalStorage = { version: "1.2", scenarios }
		localStorage.setItem("scenarios", JSON.stringify(newLocalStorageElement))
	}

	private static loadScenarios(): RecursivePartial<Scenery>[] {
		const ccLocalStorage: CCLocalStorage = JSON.parse(localStorage.getItem("scenarios"))
		if (ccLocalStorage) {
			return ccLocalStorage.scenarios
		} else {
			this.setScenariosToLocalStorage(this.getPreLoadScenarios())
			return this.getPreLoadScenarios()
		}
	}

	public static addScenario(newScenario: RecursivePartial<Scenery>) {
		this.scenarioList.push(newScenario)
		this.setScenariosToLocalStorage(this.scenarioList)
	}

	public static createNewScenario(scenarioName: string, scenarioAttributes: AddScenarioContent[]) {
		const newScenery: RecursivePartial<Scenery> = { name: scenarioName }

		scenarioAttributes.forEach(attribute => {
			switch (attribute.metricType) {
				case ScenarioMetricType.CAMERA_POSITION: {
					newScenery.camera = {
						camera: attribute.savedValues["camera"],
						cameraTarget: attribute.savedValues["cameraTarget"]
					}
					break
				}
				case ScenarioMetricType.AREA_METRIC: {
					newScenery.area = {
						areaMetric: attribute.metricName,
						margin: attribute.savedValues
					}
					break
				}
				case ScenarioMetricType.HEIGHT_METRIC: {
					newScenery.height = {
						heightMetric: attribute.metricName,
						heightSlider: attribute.savedValues["heightSlider"],
						labelSlider: attribute.savedValues["labelSlider"]
					}
					break
				}
				case ScenarioMetricType.COLOR_METRIC: {
					newScenery.color = {
						colorMetric: attribute.metricName,
						colorRange: attribute.savedValues
					}
					break
				}
				case ScenarioMetricType.EDGE_METRIC: {
					newScenery.edge = {
						edgeMetric: attribute.metricName,
						edgePreview: attribute.savedValues["edgePreview"],
						edgeHeight: attribute.savedValues["edgeHeight"]
					}
					break
				}
			}
		})

		return newScenery
	}

	public static deleteScenario(scenarioName: String) {
		this.scenarioList = this.scenarioList.filter(item => {
			return item.name !== scenarioName
		})
		this.setScenariosToLocalStorage(this.scenarioList)
	}

	public static getDefaultScenarioSetting(): RecursivePartial<Settings> {
		return this.getScenarioSettingsByName("Complexity")
	}

	public static getScenarioSettingsByName(name: string): RecursivePartial<Settings> {
		const scenery: RecursivePartial<Scenery> = this.scenarioList.find(s => s.name == name)
		const partialDynamicSettings: RecursivePartial<DynamicSettings> = {}
		const partialAppSettings: RecursivePartial<AppSettings> = {}
		for (const sceneryKey in scenery) {
			switch (sceneryKey) {
				case "area": {
					partialDynamicSettings.areaMetric = scenery.area.areaMetric
					partialDynamicSettings.margin = scenery.area.margin
					break
				}
				case "height": {
					partialDynamicSettings.heightMetric = scenery.height.heightMetric
					partialAppSettings.amountOfTopLabels = scenery.height.labelSlider
					partialAppSettings.scaling = scenery.height.heightSlider
					break
				}
				case "color": {
					partialDynamicSettings.colorMetric = scenery.color.colorMetric
					partialDynamicSettings.colorRange = scenery.color.colorRange
					break
				}
				case "edge": {
					partialDynamicSettings.edgeMetric = scenery.edge.edgeMetric
					partialAppSettings.edgeHeight = scenery.edge.edgeHeight
					partialAppSettings.amountOfEdgePreviews = scenery.edge.edgePreview
					break
				}
				case "camera": {
					partialAppSettings.camera = scenery.camera.camera
					partialAppSettings.cameraTarget = scenery.camera.cameraTarget
				}
			}
		}

		return { appSettings: partialAppSettings, dynamicSettings: partialDynamicSettings }
	}

	public static importScenarios(scenarios: ScenarioAsSettings[]): ScenarioAsSettings[] {
		scenarios.forEach(scenario => {
			convertToVectors(scenario.settings)
		})
		return scenarios
	}

	public static isScenarioExisting(scenarioName: string) {
		return this.scenarioList.some(x => x.name == scenarioName)
	}
}
