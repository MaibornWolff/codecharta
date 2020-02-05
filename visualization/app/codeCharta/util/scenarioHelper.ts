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
	private static scenarios: Scenario[] = ScenarioHelper.loadScenarios()

	private static loadScenarios(): Scenario[] {
		const scenarios = JSON.parse(localStorage.getItem("scenarios"))
		if (scenarios) {
			return scenarios
		} else {
			localStorage.setItem("scenarios", JSON.stringify(this.getPreLoadScenarios()))
			return this.getPreLoadScenarios()
		}
	}

	private static getPreLoadScenarios(): Scenario[] {
		return ScenarioHelper.importScenarios(require("../assets/scenarios.json"))
	}

	public static getScenarios(): Scenario[] {
		return this.scenarios
	}

	public static addScenario(
		scenarioName: string,
		dynamicSettingPartial: RecursivePartial<DynamicSettings>,
		appSettingsPartial: RecursivePartial<AppSettings>
	) {
		const newScenario: Scenario = {
			name: scenarioName,
			settings: {
				appSettings: appSettingsPartial,
				dynamicSettings: dynamicSettingPartial
			}
		}
		this.scenarios.push(newScenario)
		localStorage.setItem("scenarios", JSON.stringify(this.scenarios))
	}

	public static createNewScenario(scenarioName: string, attributes: AddAttributeContent[]) {
		const partialDynamicSettings: RecursivePartial<DynamicSettings> = {}
		const partialAppSettings: RecursivePartial<AppSettings> = {}
		attributes.forEach(x => {
			switch (x.metricName) {
				case ScenarioCheckboxNames.cameraPosition: {
					partialAppSettings.camera = x.metricAttributeValue
					break
				}
				case "Area": {
					partialDynamicSettings.areaMetric = x.currentMetric
					partialDynamicSettings.margin = x.metricAttributeValue
					break
				}
				case "Height": {
					partialDynamicSettings.heightMetric = x.currentMetric
					partialAppSettings.scaling = x.metricAttributeValue["heightSlider"]
					partialAppSettings.amountOfTopLabels = x.metricAttributeValue["labelSlider"]
					break
				}
				case "Color": {
					partialDynamicSettings.colorMetric = x.currentMetric
					partialDynamicSettings.colorRange = x.metricAttributeValue
					break
				}
				case "Edge": {
					partialDynamicSettings.edgeMetric = x.currentMetric
					partialAppSettings.amountOfEdgePreviews = x.metricAttributeValue["edgePreview"]
					partialAppSettings.edgeHeight = x.metricAttributeValue["edgeHeight"]
					break
				}
			}
		})
		this.addScenario(scenarioName, partialDynamicSettings, partialAppSettings)
	}

	public static getNumberOfScenarios() {
		return this.scenarios.length
	}

	public static deleteScenario(scenarioName: String) {
		this.scenarios = this.scenarios.filter(item => {
			return item.name !== scenarioName
		})
		localStorage.setItem("scenarios", JSON.stringify(this.scenarios))
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
		return this.scenarios.find(s => s.name == "Complexity")
	}

	public static getScenarioSettingsByName(name: string): RecursivePartial<Settings> {
		return this.scenarios.find(s => s.name == name).settings
	}

	public static importScenarios(scenarios: Scenario[]): Scenario[] {
		scenarios.forEach(scenario => {
			convertToVectors(scenario.settings)
		})
		return scenarios
	}

	public static isScenarioExisting(scenarioName: string) {
		return this.scenarios.find(x => x.name == scenarioName)
	}
}
