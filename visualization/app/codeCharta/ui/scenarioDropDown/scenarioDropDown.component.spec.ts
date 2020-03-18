import "./scenarioDropDown.module"
import "../codeMap/threeViewer/threeViewer.module"
import { ScenarioDropDownController } from "./scenarioDropDown.component"
import { IRootScopeService } from "angular"
import { getService, instantiateModule } from "../../../../mocks/ng.mockhelper"
import { MetricService } from "../../state/metric.service"
import { ScenarioHelper } from "../../util/scenarioHelper"
import { MetricData } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { setState } from "../../state/store/state.actions"
import { DialogService } from "../dialog/dialog.service"
import { DEFAULT_SCENARIO, STATE } from "../../util/dataMocks"
import { setColorRange } from "../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { ThreeOrbitControlsService } from "../codeMap/threeViewer/threeOrbitControlsService"

describe("ScenarioDropDownController", () => {
	let scenarioButtonsController: ScenarioDropDownController
	let $rootScope: IRootScopeService
	let storeService: StoreService
	let dialogService: DialogService
	let threeOrbitControlsService: ThreeOrbitControlsService
	let metricData: MetricData[]

	function rebuildController() {
		scenarioButtonsController = new ScenarioDropDownController($rootScope, storeService, dialogService, threeOrbitControlsService)
	}

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.scenarioDropDown")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		dialogService = getService<DialogService>("dialogService")
		threeOrbitControlsService = getService<ThreeOrbitControlsService>("threeOrbitControlsService")

		metricData = [{ name: "rloc", maxValue: 999999 }, { name: "functions", maxValue: 999999 }, { name: "mcc", maxValue: 999999 }]
	}

	beforeEach(() => {
		restartSystem()
		rebuildController()
	})

	afterEach(() => {
		jest.resetAllMocks()
	})

	describe("constructor", () => {
		it("should subscribe to MetricService on construction", () => {
			MetricService.subscribe = jest.fn()

			rebuildController()

			expect(MetricService.subscribe).toHaveBeenCalledWith($rootScope, scenarioButtonsController)
		})
	})

	describe("onMetricDataAdded", () => {
		it("should call getScenarios and set the scenarios in viewmodel correctly", () => {
			ScenarioHelper.getScenarios = jest.fn().mockReturnValue([{ name: "scenario", settings: {} }])

			scenarioButtonsController.onMetricDataAdded(metricData)

			expect(scenarioButtonsController["_viewModel"].scenarios).toEqual([{ name: "scenario", settings: {} }])
		})
	})

	describe("applyScenario", () => {
		it("should call getScenarioSettingsByName, setControl and call store.dispatch with scenarioSettings", () => {
			ScenarioHelper.getScenarioSettingsByName = jest.fn().mockReturnValue(STATE)
			scenarioButtonsController["isScenarioAppliable"] = jest.fn().mockReturnValue(true)
			storeService.dispatch = jest.fn()
			threeOrbitControlsService.setControlTarget = jest.fn()

			scenarioButtonsController.applyScenario("Scenario1")

			expect(storeService.dispatch).toHaveBeenCalledWith(setState(STATE))
			expect(storeService.dispatch).toHaveBeenCalledWith(setColorRange(STATE.dynamicSettings.colorRange))
			expect(threeOrbitControlsService.setControlTarget).toHaveBeenCalled()
		})
		it("should not apply the Scenario when isScenarioAppliable returns false", () => {
			ScenarioHelper.getScenarioSettingsByName = jest.fn().mockReturnValue(STATE)
			scenarioButtonsController["isScenarioAppliable"] = jest.fn().mockReturnValue(false)
			dialogService.showErrorDialog = jest.fn()

			scenarioButtonsController.applyScenario("Scenario1")

			expect(dialogService.showErrorDialog).toHaveBeenCalled()
		})
	})

	describe("getVisibility", () => {
		beforeEach(() => {
			scenarioButtonsController["_viewModel"].scenarios = DEFAULT_SCENARIO
		})

		it("should set the visibility of the camera icon to light gray if the scenario does not contain camera", () => {
			const result = scenarioButtonsController.getVisibility("view", "Complexity")
			const lightGray = "#d3d3d3"

			expect(result).toEqual(lightGray)
		})
		it("should not set the visibility of the area icon to light gray if the scenario contains areaMetric", () => {
			const result = scenarioButtonsController.getVisibility("area", "Complexity")
			const lightGray = "#d3d3d3"

			expect(result).not.toEqual(lightGray)
		})
		it("should return an empty String when the icon parameter is unknown", () => {
			const result = scenarioButtonsController.getVisibility("notAnIcon", "Complexity")

			expect(result).toEqual("")
		})
	})

	describe("getButtonColor", () => {
		it("should return black if map has been changed", () => {
			scenarioButtonsController["_viewModel"].isScenarioChanged = true

			const result = scenarioButtonsController.getButtonColor()

			expect(result).toEqual("black")
		})
		it("should return gray if map has not been changed", () => {
			scenarioButtonsController["_viewModel"].isScenarioChanged = false

			const result = scenarioButtonsController.getButtonColor()

			expect(result).toEqual("gray")
		})
	})

	describe("showAddScenarioSettings", () => {
		it("should call showAddScenarioSettings", () => {
			dialogService.showAddScenarioSettings = jest.fn()

			scenarioButtonsController.showAddScenarioSettings()

			expect(dialogService.showAddScenarioSettings).toHaveBeenCalled()
		})
	})

	describe("removeScenario", () => {
		beforeEach(() => {
			ScenarioHelper.deleteScenario = jest.fn()
		})

		it("should call deleteScenario", () => {
			scenarioButtonsController.removeScenario("Scenario1")

			expect(ScenarioHelper.deleteScenario).toHaveBeenCalledWith("Scenario1")
		})

		it("should not call deleteScenario, when the scenario selected is Complexity", () => {
			scenarioButtonsController.removeScenario("Complexity")

			expect(ScenarioHelper.deleteScenario).not.toHaveBeenCalled()
		})
	})
})
