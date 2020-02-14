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

describe("ScenarioDropDownController", () => {
	let $rootScope: IRootScopeService
	let storeService: StoreService
	let dialogService: DialogService
	let scenarioButtonsController: ScenarioDropDownController
	let metricData: MetricData[]

	function rebuildController() {
		scenarioButtonsController = new ScenarioDropDownController($rootScope, storeService, dialogService)
	}

	function restartSystem() {
		instantiateModule("app.codeCharta.ui.scenarioDropDown")

		$rootScope = getService<IRootScopeService>("$rootScope")
		storeService = getService<StoreService>("storeService")
		dialogService = getService<DialogService>("dialogService")

		metricData = [
			{ name: "rloc", maxValue: 999999, availableInVisibleMaps: true },
			{ name: "functions", maxValue: 999999, availableInVisibleMaps: true },
			{ name: "mcc", maxValue: 999999, availableInVisibleMaps: true }
		]
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
		it("should call getScenarioSettingsByName and call store.dispatch with scenarioSettings", () => {
			ScenarioHelper.getScenarioSettingsByName = jest.fn().mockReturnValue(STATE)
			scenarioButtonsController["isScenarioAppliable"] = jest.fn().mockReturnValue(true)
			storeService.dispatch = jest.fn()

			scenarioButtonsController.applyScenario("Scenario1")

			expect(storeService.dispatch).toHaveBeenCalledWith(setState(STATE))
			expect(storeService.dispatch).toHaveBeenCalledWith(setColorRange(STATE.dynamicSettings.colorRange))
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

	describe("showAddScenarioSettings", () => {
		it("should call showAddScenarioSettings", () => {
			dialogService.showAddScenarioSettings = jest.fn()

			scenarioButtonsController.showAddScenarioSettings()

			expect(dialogService.showAddScenarioSettings).toHaveBeenCalled()
		})
	})

	describe("removeScenario", () => {
		it("should call deleteScenario", () => {
			ScenarioHelper.deleteScenario = jest.fn()

			scenarioButtonsController.removeScenario("Scenario1")

			expect(ScenarioHelper.deleteScenario).toHaveBeenCalled()
		})
	})
})
