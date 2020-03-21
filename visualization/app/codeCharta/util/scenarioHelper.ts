"use strict"
import { AppSettings, DynamicSettings, MetricData, RecursivePartial, Settings } from "../codeCharta.model"
import { convertToVectors } from "./settingsHelper"
import { AddScenarioContent, ScenarioMetricType } from "../ui/dialog/dialog.addScenarioSettings.component"
import { ScenarioItem } from "../ui/scenarioDropDown/scenarioDropDown.component"

export interface Scenario {
	name: string
	settings: RecursivePartial<Settings>
}

export class ScenarioHelper {
	//TODO: Move Scenarios to Redux Store
	private static scenarioList: Scenario[] = ScenarioHelper.loadScenarios()

	public static getScenarioItems(metricData: MetricData[]) {
		const scenarioItemList: ScenarioItem[] = []

		this.scenarioList.forEach(scenario => {
			scenarioItemList.push({
				scenarioName: scenario.name,
				isScenarioAppliable: this.isScenarioAppliable(scenario.settings.dynamicSettings, metricData),
				icons: [
					{
						faIconClass: "fa-video-camera",
						isSaved: !!scenario.settings.appSettings.camera
					},
					{
						faIconClass: "fa-arrows-alt",
						isSaved: !!scenario.settings.dynamicSettings.areaMetric
					},
					{
						faIconClass: "fa-paint-brush",
						isSaved: !!scenario.settings.dynamicSettings.colorMetric
					},
					{
						faIconClass: "fa-arrows-v",
						isSaved: !!scenario.settings.dynamicSettings.heightMetric
					},
					{
						faIconClass: "fa-exchange",
						isSaved: !!scenario.settings.dynamicSettings.edgeMetric
					}
				]
			})
		})
		return scenarioItemList
	}

	private static isScenarioAppliable(scenario: RecursivePartial<DynamicSettings>, metricData: MetricData[]) {
		for (let attribute in scenario) {
			if (
				typeof scenario[attribute] === "string" &&
				!metricData.find(x => x.name == scenario[attribute]) === true &&
				scenario[attribute] !== "None"
			) {
				return false
			}
		}
		return true
	}

	private static getPreLoadScenarios(): Scenario[] {
		return this.importScenarios(require("../assets/scenarios.json"))
	}

	private static setScenariosToLocalStorage(scenarios: Scenario[]) {
		localStorage.setItem("scenarios", JSON.stringify(scenarios))
	}

	private static loadScenarios(): Scenario[] {
		const localStorageScenarios: Scenario[] = JSON.parse(localStorage.getItem("scenarios"))
		if (localStorageScenarios) {
			return localStorageScenarios
		} else {
			this.setScenariosToLocalStorage(this.getPreLoadScenarios())
			return this.getPreLoadScenarios()
		}
	}

	private static createScenarioObjectWithPartialSettings(
		partialAppSettings: RecursivePartial<AppSettings>,
		partialDynamicSettings: RecursivePartial<DynamicSettings>
	) {
		const newScenario: Scenario = {
			name,
			settings: {
				appSettings: partialAppSettings,
				dynamicSettings: partialDynamicSettings
			}
		}
		return newScenario
	}

	public static addScenario(newScenario: Scenario) {
		this.scenarioList.push(newScenario)
		this.setScenariosToLocalStorage(this.scenarioList)
	}

	public static createNewScenario(scenarioName: string, scenarioAttributes: AddScenarioContent[]) {
		const partialDynamicSettings: RecursivePartial<DynamicSettings> = {}
		const partialAppSettings: RecursivePartial<AppSettings> = {}

		scenarioAttributes.forEach(attribute => {
			switch (attribute.metricType) {
				case ScenarioMetricType.CAMERA_POSITION: {
					partialAppSettings.camera = attribute.savedValues["camera"]
					partialAppSettings.cameraTarget = attribute.savedValues["cameraTarget"]
					break
				}
				case ScenarioMetricType.AREA_METRIC: {
					partialDynamicSettings.areaMetric = attribute.metricName
					partialDynamicSettings.margin = attribute.savedValues
					break
				}
				case ScenarioMetricType.HEIGHT_METRIC: {
					partialDynamicSettings.heightMetric = attribute.metricName
					partialAppSettings.scaling = attribute.savedValues["heightSlider"]
					partialAppSettings.amountOfTopLabels = attribute.savedValues["labelSlider"]
					break
				}
				case ScenarioMetricType.COLOR_METRIC: {
					partialDynamicSettings.colorMetric = attribute.metricName
					partialDynamicSettings.colorRange = attribute.savedValues
					break
				}
				case ScenarioMetricType.EDGE_METRIC: {
					partialDynamicSettings.edgeMetric = attribute.metricName
					partialAppSettings.amountOfEdgePreviews = attribute.savedValues["edgePreview"]
					partialAppSettings.edgeHeight = attribute.savedValues["edgeHeight"]
					break
				}
			}
		})

		const newScenarioObject: Scenario = this.createScenarioObjectWithPartialSettings(partialAppSettings, partialDynamicSettings)
		newScenarioObject.name = scenarioName

		return newScenarioObject
	}

	public static deleteScenario(scenarioName: String) {
		this.scenarioList = this.scenarioList.filter(item => {
			return item.name !== scenarioName
		})
		this.setScenariosToLocalStorage(this.scenarioList)
	}

	public static getDefaultScenario(): Scenario {
		return this.scenarioList.find(s => s.name == "Complexity")
	}

	public static getScenarioSettingsByName(name: string): RecursivePartial<Settings> {
		return this.scenarioList.find(s => s.name == name).settings
	}

	public static importScenarios(scenarios: Scenario[]): Scenario[] {
		scenarios.forEach(scenario => {
			convertToVectors(scenario.settings)
		})
		return scenarios
	}

	public static isScenarioExisting(scenarioName: string) {
		return this.scenarioList.some(x => x.name == scenarioName)
	}
}
