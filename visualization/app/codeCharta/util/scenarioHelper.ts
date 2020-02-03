"use strict"
import { MetricData, RecursivePartial, Settings } from "../codeCharta.model"
import { convertToVectors } from "./settingsHelper"

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

	public static addScenario() {
		let newScenary: Scenario = {
			name: "anewScenario",
			settings: {
				appSettings: {
					invertColorRange: false
				},
				dynamicSettings: {
					areaMetric: "rloc",
					heightMetric: "mcc",
					distributionMetric: "rloc"
				}
			}
		}
		this.scenarios.push(newScenary)
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
}
