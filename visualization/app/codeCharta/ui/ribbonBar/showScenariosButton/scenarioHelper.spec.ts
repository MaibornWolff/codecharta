import { ScenarioHelper, ScenarioItem, ScenarioMetricProperty } from "./scenarioHelper"
import { RecursivePartial, Scenario, Settings } from "../../../codeCharta.model"
import { Vector3 } from "three"
import scenarioJson from "../../../assets/scenarios.json"
import { ExportScenario } from "../../../codeCharta.api.model"
import {
	DEFAULT_STATE,
	PARTIAL_SETTINGS,
	SCENARIO,
	SCENARIO_ITEM_WITH_EVERYTHING_SAVED,
	SCENARIO_WITH_ONLY_HEIGHT
} from "../../../util/dataMocks"

describe("scenarioHelper", () => {
	const scenarios: ExportScenario[] = scenarioJson

	beforeEach(() => {
		ScenarioHelper["scenarios"].set("Scenario1", SCENARIO)
		ScenarioHelper["scenarios"].set("Scenario2", SCENARIO_WITH_ONLY_HEIGHT)
	})

	describe("importScenarios", () => {
		it("should convert vectors when importing scenarios", () => {
			scenarios[0].camera = {
				camera: { x: 0, y: 1, z: 2 } as Vector3,
				cameraTarget: { x: 0, y: 1, z: 2 } as Vector3
			}
			const result = ScenarioHelper.importScenarios(scenarios)

			expect(result[0].camera.camera.clone).not.toBeUndefined()
		})
	})
	describe("getScenarioSettingsByName", () => {
		it("should return Settings for Scenario1", () => {
			const result = ScenarioHelper.getScenarioSettings(ScenarioHelper["scenarios"].get("Scenario1"))

			expect(result).toEqual(PARTIAL_SETTINGS)
		})
		it("should return Settings for Scenario2", () => {
			const result = ScenarioHelper.getScenarioSettings(ScenarioHelper["scenarios"].get("Scenario2"))
			const expected = {
				dynamicSettings: { heightMetric: "mcc" },
				appSettings: { amountOfTopLabels: 31, scaling: new Vector3(1, 1.8, 1) }
			}

			expect(result).toEqual(expected)
		})
		it("should return an settingsobject with empty dynamic- and appSettings if the list does not contain the scenario", () => {
			const result = ScenarioHelper.getScenarioSettings(undefined)
			const expected: RecursivePartial<Settings> = { dynamicSettings: {}, appSettings: {} }

			expect(result).toEqual(expected)
		})
	})

	describe("getScenarioItems", () => {
		beforeEach(() => {
			ScenarioHelper["scenarios"].clear()
		})
		it("should get all the items with its visibility", () => {
			ScenarioHelper["scenarios"].set("Scenario1", SCENARIO)

			const expected: ScenarioItem[] = SCENARIO_ITEM_WITH_EVERYTHING_SAVED

			const result = ScenarioHelper.getScenarioItems({
				nodeMetricData: [{ key: "mcc", maxValue: 56, minValue: 1 }],
				edgeMetricData: [{ key: "pairingRate", maxValue: 47, minValue: 1 }]
			})

			expect(result).toEqual(expected)
		})

		it("should set isScenarioApplicable to true when metric is in metricData", () => {
			ScenarioHelper["scenarios"].set("Scenario2", SCENARIO_WITH_ONLY_HEIGHT)

			const expected: ScenarioItem[] = [
				{
					scenarioName: "Scenario2",
					isScenarioApplicable: true,
					icons: [
						{
							faIconClass: "fa-video-camera",
							isSaved: false,
							tooltip: "Camera angle"
						},
						{
							faIconClass: "fa-arrows-alt",
							isSaved: false,
							tooltip: "Area metric"
						},
						{
							faIconClass: "fa-arrows-v",
							isSaved: true,
							tooltip: "Height metric"
						},
						{
							faIconClass: "fa-paint-brush",
							isSaved: false,
							tooltip: "Color metric"
						},
						{
							faIconClass: "fa-exchange",
							isSaved: false,
							tooltip: "Edge metric"
						}
					]
				}
			]

			const result = ScenarioHelper.getScenarioItems({
				nodeMetricData: [{ key: "mcc", maxValue: 56, minValue: 1 }],
				edgeMetricData: [{ key: "None", maxValue: 0, minValue: 1 }]
			})

			expect(result).toEqual(expected)
		})

		it("should not be applicable when EdgeMetric is not existing", () => {
			ScenarioHelper["scenarios"].set("Scenario1", SCENARIO)

			const expected: ScenarioItem[] = SCENARIO_ITEM_WITH_EVERYTHING_SAVED

			const result = ScenarioHelper.getScenarioItems({
				nodeMetricData: [
					{ key: "mcc", maxValue: 56, minValue: 1 },
					{ key: "rloc", maxValue: 43, minValue: 1 }
				],
				edgeMetricData: [{ key: "unavailableMetric", maxValue: 0, minValue: 1 }]
			})

			expect(result).toEqual(expected)
		})
	})

	describe("addScenario", () => {
		const scenarioProperties: ScenarioMetricProperty[] = [
			{
				metricType: "Camera-Position",
				metricName: null,
				savedValues: SCENARIO.camera,
				isSelected: true,
				isDisabled: false
			},
			{
				metricType: "Area-Metric",
				metricName: "rloc",
				savedValues: SCENARIO.area.margin,
				isSelected: true,
				isDisabled: false
			},
			{
				metricType: "Color-Metric",
				metricName: "mcc",
				savedValues: { colorRange: SCENARIO.color.colorRange, mapColors: SCENARIO.color.mapColors },
				isSelected: true,
				isDisabled: false
			},
			{
				metricType: "Height-Metric",
				metricName: "mcc",
				savedValues: { heightSlider: SCENARIO.height.heightSlider, labelSlider: SCENARIO.height.labelSlider },
				isSelected: true,
				isDisabled: false
			},
			{
				metricType: "Edge-Metric",
				metricName: "pairingRate",
				savedValues: { edgePreview: SCENARIO.edge.edgePreview, edgeHeight: SCENARIO.edge.edgeHeight },
				isSelected: true,
				isDisabled: false
			}
		]

		beforeEach(() => {
			ScenarioHelper["scenarios"].clear()
		})

		it("should add the new Scenario into the scenarios", () => {
			ScenarioHelper.addScenario(SCENARIO.name, scenarioProperties)
			const lastScenarioOfScenarios: RecursivePartial<Scenario> = [...ScenarioHelper["scenarios"].values()].pop()

			expect(lastScenarioOfScenarios).toEqual(SCENARIO)
		})
		it("should call setScenariosToLocalStorage with scenarios", () => {
			ScenarioHelper["setScenariosToLocalStorage"] = jest.fn()

			ScenarioHelper.addScenario(SCENARIO.name, scenarioProperties)

			expect(ScenarioHelper["setScenariosToLocalStorage"]).toHaveBeenCalledWith(ScenarioHelper["scenarios"])
		})
	})

	describe("createNewScenario", () => {
		const scenarioAttributeContent: ScenarioMetricProperty[] = [
			{
				metricType: "Camera-Position",
				metricName: null,
				savedValues: { camera: new Vector3(0, 300, 1000), cameraTarget: new Vector3(1, 1, 1) },
				isSelected: true,
				isDisabled: false
			},
			{
				metricType: "Area-Metric",
				metricName: "rloc",
				savedValues: 48,
				isSelected: true,
				isDisabled: false
			},
			{
				metricType: "Color-Metric",
				metricName: "mcc",
				savedValues: { colorRange: { from: 19, to: 67 }, mapColors: DEFAULT_STATE.appSettings.mapColors },
				isSelected: true,
				isDisabled: false
			},
			{
				metricType: "Height-Metric",
				metricName: "mcc",
				savedValues: { heightSlider: new Vector3(1, 1.8, 1), labelSlider: 31 },
				isSelected: true,
				isDisabled: false
			},
			{
				metricType: "Edge-Metric",
				metricName: "pairingRate",
				savedValues: { edgePreview: 5, edgeHeight: 4 },
				isSelected: true,
				isDisabled: false
			}
		]

		it("should create a Scenario according to the given scenarioAttributeContent ", () => {
			const result: RecursivePartial<Scenario> = ScenarioHelper.createNewScenario("Scenario1", scenarioAttributeContent)

			expect(result).toEqual(SCENARIO)
		})

		it("should create a Scenario only with height attributes", () => {
			const scenarioAttributeContentWithOnlyHeight: ScenarioMetricProperty[] = [
				{
					metricType: "Height-Metric",
					metricName: "mcc",
					savedValues: { heightSlider: new Vector3(1, 1.8, 1), labelSlider: 31 },
					isSelected: true,
					isDisabled: false
				},
				{
					metricType: "Color-Metric",
					metricName: "mcc",
					savedValues: { colorRange: { from: 19, to: 67 }, mapColors: DEFAULT_STATE.appSettings.mapColors },
					isSelected: false,
					isDisabled: false
				}
			]

			const result: RecursivePartial<Scenario> = ScenarioHelper.createNewScenario("Scenario2", scenarioAttributeContentWithOnlyHeight)

			expect(result).toEqual(SCENARIO_WITH_ONLY_HEIGHT)
		})
	})

	describe("deleteScenario", () => {
		beforeEach(() => {
			ScenarioHelper["scenarios"].clear()
		})
		it("should remove the Scenario from Scenarios", () => {
			ScenarioHelper["scenarios"].set("Scenario", { name: "Scenario", area: { areaMetric: "mcc", margin: 48 } })
			ScenarioHelper.deleteScenario("Scenario")

			expect(ScenarioHelper["scenarios"]).toEqual(new Map<string, RecursivePartial<Scenario>>())
		})

		it("should not delete an Element when it doesn't exist ", () => {
			ScenarioHelper["scenarios"].set("Scenario", { name: "Scenario", area: { areaMetric: "mcc", margin: 48 } })

			ScenarioHelper.deleteScenario("UnknownScenario")
			const expected = new Map<string, RecursivePartial<Scenario>>()
			expected.set("Scenario", { name: "Scenario", area: { areaMetric: "mcc", margin: 48 } })

			expect(ScenarioHelper["scenarios"]).toEqual(expected)
		})

		it("should find the specific Scenario and delete it ", () => {
			ScenarioHelper["scenarios"].set("Scenario1", {
				name: "Scenario1",
				area: { areaMetric: "rloc", margin: 48 }
			})
			ScenarioHelper["scenarios"].set("Scenario2", {
				name: "Scenario2",
				height: { heightMetric: "mcc", labelSlider: 2 }
			})
			ScenarioHelper["scenarios"].set("Scenario3", { name: "Scenario3", color: { colorMetric: "mcc" } })

			ScenarioHelper.deleteScenario("Scenario2")
			const expected = new Map<string, RecursivePartial<Scenario>>()
			expected.set("Scenario1", { name: "Scenario1", area: { areaMetric: "rloc", margin: 48 } })
			expected.set("Scenario3", { name: "Scenario3", color: { colorMetric: "mcc" } })

			expect(ScenarioHelper["scenarios"]).toEqual(expected)
		})

		it("should call setScenariosToLocalStorage", () => {
			ScenarioHelper["setScenariosToLocalStorage"] = jest.fn()

			ScenarioHelper.deleteScenario("Complexity")

			expect(ScenarioHelper["setScenariosToLocalStorage"]).toHaveBeenCalled()
		})
	})

	describe("isScenarioExisting ", () => {
		it("should return true if Scenario is existing", () => {
			expect(ScenarioHelper.isScenarioExisting("Scenario2")).toBeTruthy()
		})

		it("should return true if Scenario is existing", () => {
			expect(ScenarioHelper.isScenarioExisting("someScenario")).toBeFalsy()
		})
	})
})
