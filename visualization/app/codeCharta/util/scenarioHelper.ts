"use strict"
import { AppSettings, DynamicSettings, MetricData, RecursivePartial, Scenario, Settings } from "../codeCharta.model"
import { convertToVectors } from "./settingsHelper"
import { AddAttributeContent } from "../ui/dialog/dialog.addScenarioSettings.component"

export interface Scenario {
	name: string
	settings: RecursivePartial<Settings>
}

export class ScenarioHelper {
	//TODO: Move Scenarios to Redux Store
	private static scenarios: Scenario[] = ScenarioHelper.importScenarios(require("../assets/scenarios.json"))

	public static getScenarios(metricData: MetricData[]): Scenario[] {
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
	}

	public static createNewScenario(scenarioName: string, attributes: AddAttributeContent[]) {
		const partialDynamicSettings: RecursivePartial<DynamicSettings> = {}
		const partialAppSettings: RecursivePartial<AppSettings> = {}
		attributes.forEach(x => {
			switch (x.metricName) {
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
		const indexOfScenario = this.scenarios.indexOf(this.scenarios.find(x => x.name === scenarioName))
		this.scenarios.splice(indexOfScenario, 1)
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
