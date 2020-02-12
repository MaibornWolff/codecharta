"use strict"
import { AppSettings, DynamicSettings, MetricData, RecursivePartial, Scenario, Settings } from "../codeCharta.model"
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
		const defaultScenarios: Scenario[] = JSON.parse(localStorage.getItem("scenarios"))
		if (defaultScenarios) {
			return defaultScenarios
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
				case ScenarioCheckboxNames.CAMERAPOSITION: {
					partialAppSettings.camera = attribute.metricAttributeValue
					break
				}
				case ScenarioCheckboxNames.AREAMETRIC: {
					partialDynamicSettings.areaMetric = attribute.currentMetric
					partialDynamicSettings.margin = attribute.metricAttributeValue
					break
				}
				case ScenarioCheckboxNames.HEIGHTMETRIC: {
					partialDynamicSettings.heightMetric = attribute.currentMetric
					partialAppSettings.scaling = attribute.metricAttributeValue["heightSlider"]
					partialAppSettings.amountOfTopLabels = attribute.metricAttributeValue["labelSlider"]
					break
				}
				case ScenarioCheckboxNames.COLORMETRIC: {
					partialDynamicSettings.colorMetric = attribute.currentMetric
					partialDynamicSettings.colorRange = attribute.metricAttributeValue
					break
				}
				case ScenarioCheckboxNames.EDGEMETRIC: {
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

	public static getNumberOfScenarios() {
		return this.scenarioList.length
	}

	public static deleteScenario(scenarioName: String) {
		this.scenarioList = this.scenarioList.filter(item => {
			return item.name !== scenarioName
		})
		this.setScenariosToLocalStorage(this.scenarioList)
	}

	public static isScenarioPossible(scenario: Scenario, metricData: MetricData[]): boolean {
		const metrics = metricData.map(x => x.name)
		return (
			metrics.includes(scenario.settings.dynamicSettings.areaMetric) &&
			metrics.includes(scenario.settings.dynamicSettings.heightMetric) &&
			metrics.includes(scenario.settings.dynamicSettings.colorMetric)
		)
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
