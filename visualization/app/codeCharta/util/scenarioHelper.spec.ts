import { ScenarioHelper } from "./scenarioHelper"
import { MetricData, Scenario } from "../codeCharta.model"

describe("scenarioHelper", () => {
	let metricData: MetricData[]
	const scenarios: Scenario[] = require("../assets/scenarios.json")

	afterEach(() => {
		jest.resetAllMocks()
	})

	beforeEach(() => {
		metricData = [
			{ name: "rloc", maxValue: 999999, availableInVisibleMaps: true },
			{ name: "functions", maxValue: 999999, availableInVisibleMaps: true },
			{ name: "mcc", maxValue: 999999, availableInVisibleMaps: true }
		]
	})

	describe("getScenarios", () => {
		it("should get all scenarios", () => {
			ScenarioHelper.isScenarioPossible = jest.fn((scenario: Scenario, metricData: MetricData[]) => {
				return true
			})

			const result = ScenarioHelper.getScenarios(metricData)
			const expected = scenarios

			expect(result).toEqual(expected)
			scenarios.forEach((scenario: Scenario) => {
				expect(ScenarioHelper.isScenarioPossible).toBeCalledWith(scenario, metricData)
			})
			expect(ScenarioHelper.isScenarioPossible).toHaveBeenCalledTimes(scenarios.length)
		})

		it("should get no scenarios", () => {
			ScenarioHelper.isScenarioPossible = jest.fn((scenario: Scenario, metricData: MetricData[]) => {
				return false
			})

			const result = ScenarioHelper.getScenarios(metricData)
			const expected = []

			expect(result).toEqual(expected)
			scenarios.forEach((scenario: Scenario) => {
				expect(ScenarioHelper.isScenarioPossible).toBeCalledWith(scenario, metricData)
			})
			expect(ScenarioHelper.isScenarioPossible).toHaveBeenCalledTimes(scenarios.length)
		})
	})

	describe("isScenarioPossible", () => {
		it("should return true for a possible scenario", () => {
			const result = ScenarioHelper.isScenarioPossible(scenarios[0], metricData)

			expect(result).toBeTruthy()
		})

		it("should return false for an impossible scenario", () => {
			metricData = [
				{ name: "some", maxValue: 999999, availableInVisibleMaps: true },
				{ name: "weird", maxValue: 999999, availableInVisibleMaps: true },
				{ name: "metrics", maxValue: 999999, availableInVisibleMaps: true }
			]
			const result = ScenarioHelper.isScenarioPossible(scenarios[0], metricData)

			expect(result).toBeFalsy()
		})
	})

	describe("getDefaultScenario", () => {
		it("should get the first scenario in scenario.json", () => {
			const result = ScenarioHelper.getDefaultScenario()

			expect(result).toEqual(scenarios[0])
		})
	})
})
