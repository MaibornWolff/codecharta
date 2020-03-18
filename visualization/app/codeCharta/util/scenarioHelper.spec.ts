import { ScenarioHelper } from "./scenarioHelper"
import { Scenario } from "../codeCharta.model"
import { DEFAULT_SCENARIO, SCENARIO, SCENARIO_WITH_ONLY_HEIGHT } from "./dataMocks"
import { Vector3 } from "three"
import { ScenarioMetricType } from "../ui/dialog/dialog.addScenarioSettings.component"

describe("scenarioHelper", () => {
	const scenarios: Scenario[] = require("../assets/scenarios.json")

	afterEach(() => {
		jest.resetAllMocks()
	})

	beforeEach(() => {
		ScenarioHelper["scenarioList"] = DEFAULT_SCENARIO
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

	describe("getScenarios", () => {
		it("should get all scenarios", () => {
			const result = ScenarioHelper.getScenarios()

			expect(result).toEqual(DEFAULT_SCENARIO)
		})
	})

	describe("getDefaultScenario", () => {
		it("should return Complexity Scenario", () => {
			const result = ScenarioHelper.getDefaultScenario()

			expect(result.name).toEqual("Complexity")
		})
		it("should return undefined, when Complexity is not in scenarioList", () => {
			ScenarioHelper["scenarioList"] = DEFAULT_SCENARIO.filter(s => s.name != "Complexity")

			const result = ScenarioHelper.getDefaultScenario()

			expect(result).toBeUndefined()
		})
	})

	describe("getScenarioSettingsByName", () => {
		it("should return Settings for Coverage Scenario", () => {
			const result = ScenarioHelper.getScenarioSettingsByName("Coverage")
			const expected = scenarios.find(scenario => scenario.name === "Coverage")

			expect(result).toEqual(expected.settings)
		})
	})

	describe("addScenario", () => {
		afterEach(() => {
			ScenarioHelper["scenarioList"].pop()
		})
		it("should add the new Scenario into the scenarioList", () => {
			ScenarioHelper.addScenario(SCENARIO)
			const lastScenarioOfScenarioList: Scenario = ScenarioHelper["scenarioList"][ScenarioHelper["scenarioList"].length - 1]

			expect(lastScenarioOfScenarioList).toEqual(SCENARIO)
		})
		it("should call setScenariosToLocalStorage with scenarioList", () => {
			ScenarioHelper["setScenariosToLocalStorage"] = jest.fn()

			ScenarioHelper.addScenario(SCENARIO)

			expect(ScenarioHelper["setScenariosToLocalStorage"]).toHaveBeenCalledWith(ScenarioHelper["scenarioList"])
		})
	})

	describe("createNewScenario", () => {
		const scenarioAttributeContent = [
			{
				metricType: ScenarioMetricType.CAMERA_POSITION,
				metricName: null,
				savedValues: { camera: new Vector3(0, 300, 1000), cameraTarget: new Vector3(1, 1, 1) },
				isSelected: true,
				isDisabled: false
			},
			{
				metricType: ScenarioMetricType.AREA_METRIC,
				metricName: "rloc",
				savedValues: 48,
				isSelected: true,
				isDisabled: false
			},
			{
				metricType: ScenarioMetricType.COLOR_METRIC,
				metricName: "mcc",
				savedValues: { from: 19, to: 67 },
				isSelected: true,
				isDisabled: false
			},
			{
				metricType: ScenarioMetricType.HEIGHT_METRIC,
				metricName: "mcc",
				savedValues: { heightSlider: new Vector3(1, 1.8, 1), labelSlider: 31 },
				isSelected: true,
				isDisabled: false
			},
			{
				metricType: ScenarioMetricType.EDGE_METRIC,
				metricName: "pairingRate",
				savedValues: { edgePreview: 5, edgeHeight: 4 },
				isSelected: true,
				isDisabled: false
			}
		]

		it("should create a Scenario according to the given scenarioAttributeContent ", () => {
			const result: Scenario = ScenarioHelper.createNewScenario("Scenario1", scenarioAttributeContent)
			const expected: Scenario = SCENARIO

			expect(result).toEqual(expected)
		})

		it("should create a Scenario only with height attributes", () => {
			const scenarioAttributeContentWithOnlyHeight = [
				{
					metricType: ScenarioMetricType.HEIGHT_METRIC,
					metricName: "mcc",
					savedValues: { heightSlider: new Vector3(1, 1.8, 1), labelSlider: 31 },
					isSelected: true,
					isDisabled: false
				}
			]

			const result: Scenario = ScenarioHelper.createNewScenario("Scenario2", scenarioAttributeContentWithOnlyHeight)
			const expected: Scenario = SCENARIO_WITH_ONLY_HEIGHT

			expect(result).toEqual(expected)
		})

		it("should call createScenarioObjectWithPartialSettings function ", () => {
			ScenarioHelper["createScenarioObjectWithPartialSettings"] = jest.fn().mockReturnValue(SCENARIO)

			ScenarioHelper.createNewScenario("Scenario1", scenarioAttributeContent)

			expect(ScenarioHelper["createScenarioObjectWithPartialSettings"]).toHaveBeenCalled()
		})
	})

	describe("deleteScenario", () => {
		it("should remove the Scenario from ScenarioList ", () => {
			ScenarioHelper["scenarioList"] = [{ name: "Scenario", settings: { dynamicSettings: { areaMetric: "rloc" } } }]

			ScenarioHelper.deleteScenario("Scenario")

			expect(ScenarioHelper["scenarioList"]).toEqual([])
		})

		it("should not delete an Element when it doesn't exist ", () => {
			ScenarioHelper["scenarioList"] = [{ name: "Scenario", settings: { dynamicSettings: { areaMetric: "rloc" } } }]

			ScenarioHelper.deleteScenario("UnknownScenario")
			const expected = [{ name: "Scenario", settings: { dynamicSettings: { areaMetric: "rloc" } } }]

			expect(ScenarioHelper["scenarioList"]).toEqual(expected)
		})

		it("should find the specific Scenario and delete it ", () => {
			ScenarioHelper["scenarioList"] = [
				{ name: "Scenario1", settings: { dynamicSettings: { areaMetric: "rloc" } } },
				{ name: "Scenario2", settings: { dynamicSettings: { heightMetric: "mcc" } } },
				{ name: "Scenario3", settings: { dynamicSettings: { colorMetric: "mcc" } } }
			]

			ScenarioHelper.deleteScenario("Scenario2")
			const expected = [
				{ name: "Scenario1", settings: { dynamicSettings: { areaMetric: "rloc" } } },
				{ name: "Scenario3", settings: { dynamicSettings: { colorMetric: "mcc" } } }
			]

			expect(ScenarioHelper["scenarioList"]).toEqual(expected)
		})

		it("should call setScenariosToLocalStorage", () => {
			ScenarioHelper["setScenariosToLocalStorage"] = jest.fn()

			ScenarioHelper.deleteScenario("Complexity")

			expect(ScenarioHelper["setScenariosToLocalStorage"]).toHaveBeenCalled()
		})
	})

	describe("isScenarioExisting ", () => {
		it("should return true if Scenario is existing", () => {
			expect(ScenarioHelper.isScenarioExisting("Complexity")).toBeTruthy()
		})

		it("should return true if Scenario is existing", () => {
			expect(ScenarioHelper.isScenarioExisting("someScenario")).toBeFalsy()
		})
	})
})
