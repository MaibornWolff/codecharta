import { ScenarioHelper } from "./scenarioHelper"
import { RecursivePartial, Scenario, Settings } from "../codeCharta.model"
import { PARTIAL_SETTINGS, SCENARIO, SCENARIO_ITEM_WITH_EVERYTHING_SAVED, SCENARIO_WITH_ONLY_HEIGHT } from "./dataMocks"
import { Vector3 } from "three"
import { ScenarioMetricType } from "../ui/dialog/dialog.addScenarioSettings.component"
import { ScenarioItem } from "../ui/scenarioDropDown/scenarioDropDown.component"
import scenarioJson from "../assets/scenarios.json"
import { ExportScenario } from "../codeCharta.api.model"

describe("scenarioHelper", () => {
	const scenarios: ExportScenario[] = scenarioJson

	beforeEach(() => {
		ScenarioHelper["scenarios"].set("Scenario1", SCENARIO)
		ScenarioHelper["scenarios"].set("Scenario2", SCENARIO_WITH_ONLY_HEIGHT)
	})

	describe("importScenarios", () => {
		it("should convert vectors when importing scenarios", () => {
			scenarios[0].settings.appSettings.camera = { x: 0, y: 1, z: 2 } as Vector3
			expect(scenarios[0].settings.appSettings.camera.clone).toBeUndefined()

			const result = ScenarioHelper.importScenarios(scenarios)

			expect(result[0].settings.appSettings.camera.clone).not.toBeUndefined()
		})

		it("should assume 0 as default value if only one dimension is given", () => {
			scenarios[0].settings.appSettings.camera = { y: 24 } as Vector3
			expect(scenarios[0].settings.appSettings.camera.clone).toBeUndefined()

			const result = ScenarioHelper.importScenarios(scenarios)

			expect(result[0].settings.appSettings.camera.clone).not.toBeUndefined()
			expect(result[0].settings.appSettings.camera.x).toBe(1)
			expect(result[0].settings.appSettings.camera.y).toBe(24)
			expect(result[0].settings.appSettings.camera.z).toBe(1)
		})
	})
	describe("getScenarioSettingsByName", () => {
		it("should return Settings for Scenario1", () => {
			const result = ScenarioHelper.getScenarioSettingsByName("Scenario1")

			expect(result).toEqual(PARTIAL_SETTINGS)
		})
		it("should return Settings for Scenario2", () => {
			const result = ScenarioHelper.getScenarioSettingsByName("Scenario2")
			const expected = {
				dynamicSettings: { heightMetric: "mcc" },
				appSettings: { amountOfTopLabels: 31, scaling: new Vector3(1, 1.8, 1) }
			}

			expect(result).toEqual(expected)
		})
		it("should return an settingsobject with empty dynamic- and appSettings if the list does not contain the scenario", () => {
			const result = ScenarioHelper.getScenarioSettingsByName("someScenario")
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
				nodeMetricData: [{ name: "mcc", maxValue: 56 }],
				edgeMetricData: [{ name: "pairingRate", maxValue: 47 }]
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
				nodeMetricData: [{ name: "mcc", maxValue: 56 }],
				edgeMetricData: [{ name: "None", maxValue: 0 }]
			})

			expect(result).toEqual(expected)
		})

		it("should not be applicable when EdgeMetric is not existing", () => {
			ScenarioHelper["scenarios"].set("Scenario1", SCENARIO)

			const expected: ScenarioItem[] = SCENARIO_ITEM_WITH_EVERYTHING_SAVED

			const result = ScenarioHelper.getScenarioItems({
				nodeMetricData: [
					{ name: "mcc", maxValue: 56 },
					{ name: "rloc", maxValue: 43 }
				],
				edgeMetricData: [{ name: "unavailableMetric", maxValue: 0 }]
			})

			expect(result).toEqual(expected)
		})
	})

	describe("getDefaultScenario", () => {
		it("should return Complexity ExportScenario", () => {
			ScenarioHelper.getScenarioSettingsByName = jest.fn()

			ScenarioHelper.getDefaultScenarioSetting()

			expect(ScenarioHelper.getScenarioSettingsByName).toHaveBeenCalledWith("Complexity")
		})
	})

	describe("addScenario", () => {
		beforeEach(() => {
			ScenarioHelper["scenarios"].clear()
		})
		it("should add the new Scenario into the scenarios", () => {
			ScenarioHelper.addScenario(SCENARIO)
			const lastScenarioOfScenarios: RecursivePartial<Scenario> = [...ScenarioHelper["scenarios"].values()].pop()

			expect(lastScenarioOfScenarios).toEqual(SCENARIO)
		})
		it("should call setScenariosToLocalStorage with scenarios", () => {
			ScenarioHelper["setScenariosToLocalStorage"] = jest.fn()

			ScenarioHelper.addScenario(SCENARIO)

			expect(ScenarioHelper["setScenariosToLocalStorage"]).toHaveBeenCalledWith(ScenarioHelper["scenarios"])
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
			const result: RecursivePartial<Scenario> = ScenarioHelper.createNewScenario("Scenario1", scenarioAttributeContent)

			expect(result).toEqual(SCENARIO)
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
