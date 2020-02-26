"use strict"
import { AppSettings, DynamicSettings, RecursivePartial, Scenario, Settings } from "../codeCharta.model"
import { convertToVectors } from "./settingsHelper"
import { AddAttributeContent, ScenarioCheckboxNames } from "../ui/dialog/dialog.addScenarioSettings.component"

export interface Scenario {
	name: string
	settings: RecursivePartial<Settings>
}

export class ScenarioHelper {
	//TODO: Move Scenarios to Redux Store
	private static scenarioList: Scenario[] = ScenarioHelper.loadScenarios()

	public static getScenarios() {
		return this.scenarioList
	}

	private static getPreLoadScenarios(): Scenario[] {
		return ScenarioHelper.importScenarios(require("../assets/scenarios.json"))
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

	public static createNewScenario(scenarioName: string, scenarioAttributes: AddAttributeContent[]) {
		const partialDynamicSettings: RecursivePartial<DynamicSettings> = {}
		const partialAppSettings: RecursivePartial<AppSettings> = {}

		scenarioAttributes.forEach(attribute => {
			switch (attribute.metricName) {
				case ScenarioCheckboxNames.CAMERA_POSITION: {
					partialAppSettings.camera = attribute.metricAttributeValue["camera"]
					partialAppSettings.cameraTarget = attribute.metricAttributeValue["cameraTarget"]
					break
				}
				case ScenarioCheckboxNames.AREA_METRIC: {
					partialDynamicSettings.areaMetric = attribute.currentMetric
					partialDynamicSettings.margin = attribute.metricAttributeValue
					break
				}
				case ScenarioCheckboxNames.HEIGHT_METRIC: {
					partialDynamicSettings.heightMetric = attribute.currentMetric
					partialAppSettings.scaling = attribute.metricAttributeValue["heightSlider"]
					partialAppSettings.amountOfTopLabels = attribute.metricAttributeValue["labelSlider"]
					break
				}
				case ScenarioCheckboxNames.COLOR_METRIC: {
					partialDynamicSettings.colorMetric = attribute.currentMetric
					partialDynamicSettings.colorRange = attribute.metricAttributeValue
					break
				}
				case ScenarioCheckboxNames.EDGE_METRIC: {
					partialDynamicSettings.edgeMetric = attribute.currentMetric
					partialAppSettings.amountOfEdgePreviews = attribute.metricAttributeValue["edgePreview"]
					partialAppSettings.edgeHeight = attribute.metricAttributeValue["edgeHeight"]
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
		return this.scenarioList.find(x => x.name == scenarioName)
	}
}
