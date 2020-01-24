import { ScenarioHelper } from "./scenarioHelper"
import { MetricData, Scenario } from "../model/codeCharta.model"

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

	describe("importScenarios", () => {
		it("should convert vectors when importing scenarios", () => {
			scenarios[0].settings.appSettings.camera = { x: 0, y: 1, z: 2 } as any
			expect(scenarios[0].settings.appSettings.camera.clone).toBeUndefined()

			const result = ScenarioHelper.importScenarios(scenarios)

			expect(result[0].settings.appSettings.camera.clone).not.toBeUndefined()
		})

		it("should assume 0 as default value if only one dimension is given", () => {
			scenarios[0].settings.appSettings.camera = { y: 24 } as any
			expect(scenarios[0].settings.appSettings.camera.clone).toBeUndefined()

			const result = ScenarioHelper.importScenarios(scenarios)

			expect(result[0].settings.appSettings.camera.clone).not.toBeUndefined()
			expect(result[0].settings.appSettings.camera.x).toBe(1)
			expect(result[0].settings.appSettings.camera.y).toBe(24)
			expect(result[0].settings.appSettings.camera.z).toBe(1)
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

	describe("getScenarios", () => {
		it("should get all scenarios", () => {
			ScenarioHelper.isScenarioPossible = jest.fn().mockReturnValue(true)

			const result = ScenarioHelper.getScenarios(metricData)
			const expected = scenarios

			expect(result).toEqual(expected)
			scenarios.forEach((scenario: Scenario) => {
				expect(ScenarioHelper.isScenarioPossible).toBeCalledWith(scenario, metricData)
			})
			expect(ScenarioHelper.isScenarioPossible).toHaveBeenCalledTimes(scenarios.length)
		})

		it("should get no scenarios", () => {
			ScenarioHelper.isScenarioPossible = jest.fn().mockReturnValue(false)

			const result = ScenarioHelper.getScenarios(metricData)
			const expected = []

			expect(result).toEqual(expected)
			scenarios.forEach((scenario: Scenario) => {
				expect(ScenarioHelper.isScenarioPossible).toBeCalledWith(scenario, metricData)
			})
			expect(ScenarioHelper.isScenarioPossible).toHaveBeenCalledTimes(scenarios.length)
		})
	})

	describe("getDefaultScenario", () => {
		it("should get the first scenario in scenario.json", () => {
			const result = ScenarioHelper.getDefaultScenario()

			expect(result).toEqual(scenarios[0])
		})
	})

	describe("getScenarioSettingsByName", () => {
		it("should get the first scenario in scenario.json", () => {
			const result = ScenarioHelper.getScenarioSettingsByName("Complexity")

			expect(result).toEqual(scenarios[0].settings)
		})
	})
})
